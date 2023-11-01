import { Router } from 'express'
import Controller from '../controllers'

const UrlRouter = Router()

UrlRouter.get("/", Controller.url.getUrl)
UrlRouter.post("/", Controller.url.createUrl)

export default UrlRouter