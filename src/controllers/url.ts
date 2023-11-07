import type { Request, Response, Url } from '../utils/types'
import db from '../utils/db'

export default class UrlController {
    static isValidUrl(url: string) {
        return new RegExp('^(http|https)://', 'i').test(url)
    }

    static generateShortUrl(
        suggestion: string = "",
        callback: (error: Error | null, shortenedUrl: string | null) => void
    ): void {
        const suggestionRegex = /^[a-zA-Z0-9]{3,20}$/
        let randomSuggestion = Math.random().toString(36).substring(2, 15)

        if (suggestionRegex.test(suggestion) && suggestion) {
            // check if that suggestion is already in the database
            db.get<Url>(
                'SELECT * FROM url WHERE shortened_url = ?',
                [suggestion],
                (error, row) => {
                    if (error) {
                        callback(new Error('Something went wrong while generating the url'), null)
                    }
                    if (row && row.id > 0) {
                        callback(null, randomSuggestion)
                    } else {
                        callback(null, suggestion)
                    }
                }
            )
        } else {
            callback(null, randomSuggestion)
        }
    }

    public static getUrl(req: Request, res: Response) {
        // get the shortened url from the request if one, if not return all the urls
        const { shortened_url } = req.query
        if (shortened_url) {
            db.get<Url>(
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

        // check if the url provided is already in the database
        db.get<Url>(
            'SELECT * FROM url WHERE original_url = ?',
            [url],
            (error, row) => {
                if (error) {
                    console.error("Erro: ", error)
                    return res.status(500).send({
                        ok: false,
                        data: {
                            message: 'Something went wrong while creating the url'
                        }
                    })
                }
                if (row && row.id > 0) {
                    // if the url already exists and is not expired yet, return it
                    if (new Date(row.expiration_date) > new Date(Date.now())) {
                        return res.send({
                            ok: true,
                            data: row
                        })
                    } else {
                        UrlController.generateShortUrl(suggestion, (error, finalSuggestion) => {
                            if (error || !finalSuggestion) {
                                return res.status(500).send({
                                    ok: false,
                                    data: {
                                        message: 'Something went wrong while creating the url'
                                    }
                                })
                            }

                            const expirationDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
                            db.run(
                                'INSERT INTO url (expiration_date, original_url, shortened_url) VALUES (?, ?, ?)',
                                [expirationDate, url, finalSuggestion],
                                function(error) {
                                    if (error) {
                                        return res.status(500).send({
                                            ok: false,
                                            data: {
                                                message: 'Something went wrong while creating the url'
                                            }
                                        })
                                    }
                                    return res.send({
                                        ok: true,
                                        data: {
                                            id: this.lastID,
                                            expiration_date: expirationDate,
                                            original_url: url,
                                            shortened_url: finalSuggestion
                                        }
                                    })
                                
                                }
                            )
                        })
                    }

                } else {
                    UrlController.generateShortUrl(suggestion, (error, finalSuggestion) => {
                        if (error || !finalSuggestion) {
                            return res.status(500).send({
                                ok: false,
                                data: {
                                    message: 'Something went wrong while creating the url'
                                }
                            })
                        }

                        const expirationDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
                        db.run(
                            'INSERT INTO url (expiration_date, original_url, shortened_url) VALUES (?, ?, ?)',
                            [expirationDate, url, finalSuggestion],
                            function(error) {
                                if (error) {
                                    return res.status(500).send({
                                        ok: false,
                                        data: {
                                            message: 'Something went wrong while creating the url'
                                        }
                                    })
                                }
                                return res.send({
                                    ok: true,
                                    data: {
                                        id: this.lastID,
                                        expiration_date: expirationDate,
                                        original_url: url,
                                        shortened_url: finalSuggestion
                                    }
                                })
                            
                            }
                        )
                    })
                }
            }
        )

    }

    public static redirectToUrl(req: Request, res: Response) {
        const { shortened_url } = req.params

        if (!shortened_url) {
            return res.status(400).send({
                ok: false,
                data: {
                    message: 'Missing shortened_url param'
                }
            })
        }

        db.get<Url>(
            'SELECT * FROM url WHERE shortened_url = ?',
            [shortened_url],
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
                    if (new Date(row.expiration_date) > new Date(Date.now())) {
                        return res.redirect(row.original_url)
                    } else {
                        return res.status(404).send({
                            ok: false,
                            data: {
                                message: 'Url not found'
                            }
                        })
                    }
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
    }
}