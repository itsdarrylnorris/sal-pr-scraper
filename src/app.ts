import cheerio from 'cheerio'
import 'isomorphic-fetch'

/**
 * SalPr.com Scrapper To CVS
 *
 * @url https://www.sal.pr/
 */
export class SalPrToCsv {
  private baseUrl: string = 'https://www.sal.pr/?search=5&s=restaurantes&field_name=&order=a'

  async init() {
    await this.getListOfResturants()
  }

  async getListOfResturants() {
    let payload = await fetch(this.baseUrl)
    let rawData = await payload.text()
    const $ = cheerio.load(rawData)

    // @ts-ignore
    $('.wrap_info_container').each((index: number, element: cheerio.Element) => {
      let $element = cheerio.load(element)
      console.log({ $element })
    })
  }
}

new SalPrToCsv().init()
