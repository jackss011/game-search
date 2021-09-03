import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import router from './routes'

const app = express()

// config load
dotenv.config({ path: path.join('config/config.env'), debug: true })

// CORS headers
app.use(cors())

// HTTP logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('tiny'))
}

// routing
app.use('/', router)

// running server
const PORT = process.env.PORT || 2000

app.listen(PORT, () =>
  console.log(
    `Server started successfully on port ${PORT}! [${process.env.NODE_ENV}]`
  )
)
