import * as express from 'express'
import Router from './routes'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(Router)

export default app

