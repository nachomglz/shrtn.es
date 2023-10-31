import { Router } from 'express'
import Controller from '../controllers'

const UrlRouter = Router()

UrlRouter.get("/", Controller.url.getUrl)

export default UrlRouter