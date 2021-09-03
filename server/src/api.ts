import {
  SteamWishlist,
  SteamDbPriceHistory,
  IgGameSearch,
  scraper,
} from './scraping'

export async function wishlist(vanityUrl: string) {
  const wishlist = (await SteamWishlist.perform([vanityUrl])) as any[]

  const igPromises = wishlist.map(item => {
    return IgGameSearch.perform([item.name])
  })

  const dbPromises = wishlist.map(item => {
    return SteamDbPriceHistory.perform([item.appId], true).catch(e => {
      console.error('Cannot get steamdb info for', item.appId)
      return 'error'
    })
  })

  const igResults = (await Promise.all(igPromises)).map(list =>
    list.filter(
      ({ dlc, platform }: { dlc: boolean; platform: string }) =>
        !dlc && platform === 'steam'
    )
  )

  const dbResults = await Promise.all(dbPromises)

  scraper.save()

  return wishlist.map((item, index) => {
    return { ...item, ig: igResults[index], priceHistory: dbResults[index] }
  })
}

export async function priceHistory(appId: string) {
  return await SteamDbPriceHistory.perform([appId])
}
