import type { Request, Response } from '../utils/types'
import db from '../utils/db'

export default class UrlController {
    static isValidUrl(url: string) {
        return new RegExp('^(http|https)://', 'i').test(url)
    }

    public static getUrl(req: Request, res: Response) {
        return res.send({
            ok: true,
            data: []
        })
    }

    public static createUrl(req: Request<{ url: string, suggestion: string }>, res: Response) {
        const { url, suggestion } = req.body

        // check if those params are valid, the suggestion is optional
        if (!url) {
            return res.status(400).send({
                ok: false,
                data: {
                    message: 'Missing url param'
                }
            })
        }

        // check if the url is valid
        if (!UrlController.isValidUrl(url)) {
            return res.status(400).send({
                ok: false,
                data: {
                    message: 'Invalid url'
                }
            })
        }

        // the suggestion is optional, if it's not provided, generate a random string
        // the suggestion must be unique and at least 3 characters long with a limit of 20 characters
        const suggestionRegex = /^[a-zA-Z0-9]{3,20}$/
        let finalSuggestion = suggestion
        if (!suggestion || !suggestionRegex.test(suggestion)) {
            finalSuggestion = Math.random().toString(36).substring(2, 15)
        }

        res.send({
            ok: true,
            data: {
                shortened_path: finalSuggestion
            }
        })
    }
}