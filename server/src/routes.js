import { Router } from 'express'
import * as api from './api.js'

const router = Router()

router.get('/wishlist/:id', async (req, res) => {
  try {
    const items = await api.wishlist(req.params.id)
    res.json({ items })
  } catch (e) {
    res.sendStatus(501)
    console.error(e)
  }
})

export default router
