import express from 'express'
import cors from 'cors'
import router from './routes.js'

const PORT = 2000

const app = express()
app.use(cors())
app.use('/', router)
app.listen(PORT, () => console.log('Server started successfully!'))

// steamDbPriceHistory(788100).then((r) => console.log(r));
// steamUserWishList("jackss14").then((r) => console.log(r.slice(0, 10)));
// igSearchGames("Neon Abyss").then((r) => console.log(r));
