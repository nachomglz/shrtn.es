import type { Request, Response } from 'express'

export default class UrlController {
    public static getUrl(req: Request, res: Response) {
        return res.send({
            ok: true,
            data: []
        })
    }
}