import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import e = require('express')

export interface Request<T = any> extends ExpressRequest {
    body: T
}

// Create type for the object that is sent in the response body.
export type ResponseBody<T = any> = {
    ok: boolean,
    data: T
}


// Create a custom Response type that extends the ExpressResponse type in which i can set the type for the object that is sent in the response body.
export interface Response<T = any> extends ExpressResponse {
    send: (body?: ResponseBody<T>) => any
}