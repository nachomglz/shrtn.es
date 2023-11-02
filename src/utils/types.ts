import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import e = require('express')

export interface Request<T = any> extends ExpressRequest {
    body: T
}

export type ResponseBody<T = any> = {
    ok: boolean,
    data: T
}

export interface Response<T = any> extends ExpressResponse {
    send: (body?: ResponseBody<T>) => any
}

export interface Url {
    id: number,
    expiration_date: Date,
    original_url: string,
    shortened_url: string
}