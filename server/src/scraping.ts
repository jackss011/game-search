import fetch from 'node-fetch'
import cheerio from 'cheerio'
import Scraper, { DataError } from './lib/scraper'
// const fetch: any = () => {}

export const scraper = new Scraper('api')

export const SteamSearchGames = scraper.define<any>(
  'steam-search-games',
  { cache: 3600 },
  async ([term]) => {
    term = term.trim()

    const url = `https://store.steampowered.com/search/?term=${encodeURIComponent(
      term
    )}&ignore_preferences=1`

    const text = await fetch(url).then(r => r.text())
    const $ = cheerio.load(text)

    const results = $('#search_resultsRows > a')
      .toArray()
      .map(r => {
        const appId = r.attribs['data-ds-appid']
        const bundleId = r.attribs['data-ds-bundleid']
        const name = $(r).find('.title').text()

        return { appId, bundleId, name }
      })

    return results
  }
)

export const SteamAppDetails = scraper.define(
  'steam-game-details',
  { cache: 3600 },
  async ([appId]) => {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`

    const json = (await fetch(url).then(r => r.json())) as any
    const appDetails = json?.[appId]?.['data']

    if (!appDetails) throw new DataError('Cannot get app details')

    // console.log(appDetails.header_image)

    const result = {
      appId,
      name: appDetails['name'],
      price: appDetails['price_overview']['final'] / 100,
      discount: appDetails['price_overview']['discount_percent'] / 100,
      capsule: appDetails['header_image'],
    }

    return result
  }
)

export const SteamWishlist = scraper.define<any>(
  'steam-wishlist',
  { cache: 60 },
  async ([vanityUrl]) => {
    const baseUrl = `https://store.steampowered.com/wishlist/id/${vanityUrl}/wishlistdata`

    let page = 0
    let done = false
    let result: any[] = []

    const extractData = (json: any) =>
      Object.entries(json).map(([appId, data]: [string, any]) => {
        const sub0 = data['subs']?.[0]

        return {
          appId,
          name: data.name,
          images: {
            background: data.background,
            capsule: data.capsule,
          },
          priority: parseInt(data['priority']) ?? null,
          price: sub0?.['price'] / 100 ?? null,
          discount: sub0?.['discount_pct'] / 100 ?? null,
          earlyAccess: String(data['early_access']) === '1',
          prerelease: String(data['prerelease']) === '1',
        }
      })

    while (!done) {
      const url = baseUrl + `/?p=${page}`
      const json = (await await fetch(url).then(r => r.json())) as any

      if (json.success) throw new DataError('Steam: failed wishlist fetch')

      const pageData = extractData(json)
      result = result.concat(pageData)

      if (pageData.length > 0) {
        page = page + 1
      } else {
        done = true
      }
    }

    return result.sort((a, b) => a.priority - b.priority)
  }
)

export const SteamDbPriceHistory = scraper.define<any>(
  'steamdb-price-history',
  { cache: true, expires: false, refresh: 24 * 3600 },
  async ([appId]) => {
    const headers = {
      'accept-language': 'en-US;q=0.9,en;q=0.8',
      accept: 'application/json, text/javascript, */*; q=0.01',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36' +
        Math.round(Math.random() * 10),
      'x-requested-with': 'XMLHttpRequest',
      'accept-encoding': 'gzip, deflate, br',
      referer: `'https://steamdb.info/app/${appId}/`,
    }

    const url =
      'https://steamdb.info/api/GetPriceHistory/?appid=' +
      String(appId).trim() +
      '&cc=eu'

    const page = await fetch(url, { headers })
    // console.log(await page.text())
    // process.exit(1)
    if (page.status === 429) throw new Error('SteamDB: too many requests')

    const json = (await page.json()) as any

    if (json.success === false) throw new DataError('SteamDB: wrong prices url')

    const priceHistory = json?.data?.history as any[]
    if (!priceHistory) throw new DataError('SteamDB: wrong prices json format')

    return priceHistory.map(p => ({ time: p.x, price: p.y, discount: p.d }))
  }
)

export const IgGameSearch = scraper.define<any[]>(
  'ig-game-search',
  { cache: 3600 * 2 },
  async ([term]) => {
    const region = ''
    const query = encodeURIComponent(term.trim())
    const currency = 'EUR'

    const url =
      'https://www.instant-gaming.com/en/search/?' +
      `all_types=1&all_cats=1&min_price=0&max_price=100&noprice=1&min_discount=0&max_discount=100&min_reviewsavg=10&max_reviewsavg=100&currency=${currency}` +
      `&noreviews=1&available_in=${region}&gametype=all&sort_by=&query=${query}`

    const headers = {
      'accept-language': 'en;q=0.8',
      'user-agent': 'Python/3.x requests/1.x',
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    }

    const text = await fetch(url, { headers }).then(r => r.text())
    const $ = cheerio.load(text)

    const $searchItems = $('div.item')

    const result = $searchItems.toArray().map(item => {
      const name = $(item).find('div.name').text()
      const price = parseFloat(item.attribs['data-price'])
      const dlc = String(item.attribs['data-dlc']) === '1'
      const buyLink = $(item).find('a').attr('href')

      const platform =
        $(item).find('div.badge').attr('class')?.replace('badge', '')?.trim() ??
        null

      return { name, price, dlc, platform, buyLink }
    })

    return result
  }
)

export default scraper
