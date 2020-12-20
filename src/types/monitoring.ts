import { RequestHandler } from 'express'

export type PingResponseBody = { pong: true }
export type PingRequestHandler = RequestHandler<{}, PingResponseBody, {}>
