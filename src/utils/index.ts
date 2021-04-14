const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
// Logging
const logging = function (message: string, payload: any = null) {
  let date = new Date()

  console.log(`[${date.toISOString()}] ${message}`)

  if (payload) {
    if (typeof payload === 'string' || payload instanceof String) {
      console.log(`[${date.toISOString()}] ${payload}`)
    } else {
      console.log(`[${date.toISOString()}] ${JSON.stringify(payload)}`)
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fetchWithTimer(url: string, options: any, timeout: number = 7000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
  ])
}
export { logging, capitalizeFirstLetter, sleep, fetchWithTimer }
