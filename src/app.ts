import cheerio from 'cheerio'
import fs from 'fs'
import 'isomorphic-fetch'
import jsonexport from 'jsonexport/dist'
import { logging, sleep } from './utils'
const fsPromises = fs.promises

/**
 * SalPr.com Scrapper To CVS
 *
 * @url https://www.sal.pr/
 */
export class SalPrToCsv {
  private baseUrl: string = 'https://www.sal.pr'

  async init() {
    await this.getListOfResturants()
  }

  async getListOfResturants() {
    let pageCount: number = 0
    let maxOfFetchResults: number = 1620 // Real number it's 1620
    let payload: Response | undefined
    let rawData: string
    let fetchPath: string
    let alreadyCheckResturant: string[] = []
    let resturantsData: ResturantInformation[] = []

    while (pageCount !== maxOfFetchResults) {
      const fetchPathAbortController = new AbortController()
      const timeoutId = setTimeout(() => fetchPathAbortController.abort(), 5000)

      fetchPath = `${this.baseUrl}/?search=5&s=restaurantes&field_name=&order=a&start=${pageCount}`

      // Logging data
      logging(`Trying to fetch url: ${fetchPath}`)
      // Fetch the data

      try {
        payload = await fetch(fetchPath, { signal: fetchPathAbortController.signal })
        rawData = await payload.text()
        const $ = cheerio.load(rawData)
        // If we do not have any payload let's exit out
        if (!payload) {
          logging('We could not find any payload.')
          return
        }
        // Loop thru all elements and get the urls
        $('.wrap_info_container a').each(async (index: number) => {
          let element = $('.wrap_info_container a')[index]
          let atag = $(element).attr('href') ? $(element).attr('href')?.toString() : ''

          // If there is not atag value let's skip it
          if (!atag || alreadyCheckResturant.includes(atag)) return

          alreadyCheckResturant.push(atag)
        }) // @ts-ignore

        try {
          // Call all the pages at onces and get the data
          await Promise.all(
            alreadyCheckResturant.map(async (productPath) => {
              let productFetchData = await fetch(`${this.baseUrl}${productPath}`)
              logging(`Fetching ... ${this.baseUrl}${productPath}`)

              if (!productFetchData) {
                logging('We could not find any productFetchData.')
                return
              }

              const rawProductFetchData = await productFetchData.text()
              const $productData = cheerio.load(rawProductFetchData)
              let resturantInformation: ResturantInformation = {
                resturantName: $productData('.top-big-description h1').eq(0).text()
                  ? $productData('.top-big-description h1').eq(0).text()
                  : '',
                phoneNumber: $productData('.i_contact').eq(0).next().text()
                  ? $productData('.i_contact').eq(0).next().text()
                  : '',
                facebook: $productData('.i_facebook').eq(0).attr('href')?.toString()
                  ? // @ts-ignore
                    $productData('.i_facebook').eq(0).attr('href').toString()
                  : '',
                address1: $productData('p[itemprop="streetAddress"]').eq(0).text()
                  ? $productData('p[itemprop="streetAddress"]').eq(0).text()
                  : '',
                city: $productData('.i_location').eq(1).next().text()
                  ? $productData('.i_location').eq(1).next().text()
                  : '',
                hours: $productData('.i_time').eq(0).next().text() ? $productData('.i_time').eq(0).next().text() : '',
                resturantType: $productData('ul .food-type li').text() ? $productData('ul .food-type li').text() : '',
                // @ts-ignore
                resturantWebsite: $productData('#button_website').eq(0).attr('href')?.toString()
                  ? $productData('#button_website').eq(0).attr('href')?.toString()
                  : '',
              }

              resturantsData.push(resturantInformation)
              logging(`Found something in ${productPath}`)
            }),
          )
        } catch (e) {
          logging(`Failed to fetch product data in ${fetchPath}`, e)
        }
      } catch (e) {
        logging(`Failed to fetch data in ${fetchPath}`, e)
      }

      pageCount += 30
      await sleep(1000)
    }

    logging('Done getting data')

    try {
      const csv = await jsonexport(resturantsData)
      await fsPromises.writeFile(__dirname + 'data.csv', csv)
      logging('Total ... ', { csv })
    } catch (err) {
      logging('Something went wrong', err)
    }
  }
}

new SalPrToCsv().init()
