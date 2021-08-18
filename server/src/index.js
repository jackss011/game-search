const express = require('express')
const api = require('./api')

const app = express()
const PORT = 1290

app.get('/wishlist/:id', async (req, res) => {
  try {
    const wishlistArray = await api.steamUserWishList(req.params.id)
    res.json({ items: wishlistArray })
  } catch (e) {
    res.sendStatus(500)
    console.error(e)
  }
})

app.listen(PORT, () => console.log('Server started...'))

// steamDbPriceHistory(788100).then((r) => console.log(r));
// steamUserWishList("jackss14").then((r) => console.log(r.slice(0, 10)));
// igSearchGames("Neon Abyss").then((r) => console.log(r));
