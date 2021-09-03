import { Router } from 'express'
import * as api from './api'

const router = Router()

router.get('/wishlist/:steamId', async (req, res) => {
  try {
    const items = await api.wishlist(req.params.steamId)
    res.json({ items })
  } catch (e) {
    res.sendStatus(500)
    console.error(e)
  }
})

router.get('/history/:appId', async (req, res) => {
  try {
    const history = await api.priceHistory(req.params.appId)
    res.json({ history })
  } catch (e) {
    res.sendStatus(500)
    console.error(e)
  }
})

export default router
