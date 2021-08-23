import scraper from './scraping.js'

export async function wishlist(vanityUrl) {
  const wishlist = await scraper.perform('steam-wishlist', [vanityUrl])

  const igPromises = wishlist.map(item => {
    return scraper.perform('ig-game-search', [item.name])
  })

  const igResults = await Promise.all(igPromises)

  scraper.save()

  return wishlist.map((item, index) => {
    return { ...item, ig: igResults[index] }
  })
}

// module.exports = { wishlist }
