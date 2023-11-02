import type { Request, Response, Url } from '../utils/types'
import db from '../utils/db'

export default class UrlController {
    static isValidUrl(url: string) {
        return new RegExp('^(http|https)://', 'i').test(url)
    }

    static generateSuggestion(times_executed: number = 0): string | null {
        const suggestion = Math.random().toString(36).substring(2, 15)
        // if there's an error in the query try again 5 times, if its still failing return null
        db.get<Url>('SELECT * FROM url WHERE shortened_url = ?', [suggestion], (err, row) => {
            if (err) {
                console.error(`[ERROR] ~ Checking suggestion: ${err}`)
                if (times_executed < 5) {
                    return UrlController.generateSuggestion(times_executed + 1)
                } else {
                    return null
                }
            }

            if (row && row.id > 0) {
                return UrlController.generateSuggestion()
            }
        })
        return suggestion
    }

    public static getUrl(req: Request, res: Response) {
        // get the shortened url from the request if one, if not return all the urls
        const { shortened_url } = req.query
        if (shortened_url) {
            const url = db.get<Url>(
                'SELECT * FROM url WHERE shortened_url = ? OR original_url = ?',
                [shortened_url, shortened_url],
                (error, row) => {
                    if (error) {
                        return res.status(500).send({
                            ok: false,
                            data: {
                                message: 'Something went wrong while fetching the url'
                            }
                        })
                    }
                    if (row) {
                        return res.send({
                            ok: true,
                            data: row
                        })
                    } else {
                        return res.status(404).send({
                            ok: false,
                            data: {
                                message: 'Url not found'
                            }
                        })
                    }
                }
            )
        } else {
            const urls = db.all<Url>('SELECT * FROM url', (error, rows) => {
                if (error) {
                    return res.send({
                        ok: false,
                        data: {
                            message: 'Something went wrong while fetching the urls'
                        }
                    })
                }
                return res.send({
                    ok: true,
                    data: rows
                })
            })
        }
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

        // check if url is correctly formatted
        if (!UrlController.isValidUrl(url)) {
            return res.status(400).send({
                ok: false,
                data: {
                    message: 'Invalid url'
                }
            })
        }

        const suggestionRegex = /^[a-zA-Z0-9]{3,20}$/
        let finalSuggestion: string | null = suggestion
        if (!suggestion || !suggestionRegex.test(suggestion)) {
            finalSuggestion = UrlController.generateSuggestion()
            if (finalSuggestion === null) {
                return res.status(500).send({
                    ok: false,
                    data: {
                        message: 'Something went wrong while generating the suggestion'
                    }
                })
            }
        }

        // insert the url into the db
        db.run(
            'INSERT INTO url (expiration_date, original_url, shortened_url) VALUES (?, ?, ?)',
            new Date(),
            url,
            finalSuggestion
        )

        res.send({
            ok: true,
            data: {
                shortened_path: finalSuggestion
            }
        })
    }
}