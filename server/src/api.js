import scraper from './scraping.js'

export async function wishlist(vanityUrl) {
  const wishlist = await scraper.perform('steam-wishlist', [vanityUrl])

  const igPromises = wishlist.map(item => {
    return scraper.perform('ig-game-search', [item.name])
  })

  const dbPromises = wishlist.map(item => {
    return scraper
      .perform('steamdb-price-history', [item.appId], true)
      .catch(e => {
        console.error('Cannot get steamdb info for', item.appId)
        return 'error'
      })
  })

  const igResults = await Promise.all(igPromises)
  const dbResults = await Promise.all(dbPromises)

  scraper.save()

  return wishlist.map((item, index) => {
    return { ...item, ig: igResults[index], priceHistory: dbResults[index] }
  })
}

export async function history(appId) {
  return await scraper.perform('steamdb-price-history', [appId])
}
