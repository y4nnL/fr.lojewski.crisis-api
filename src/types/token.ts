import { Joi } from 'express-validation'
import { joiRequiredEmail, joiRequiredPassword } from '@/types'
import { RequestHandler } from 'express'

export enum TokenDuration {
  Authorization = '1w'
}

export enum TokenType {
  Authorization = 'authorization'
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Request handlers

export type AuthorizationCreateRequestBody = { email: string, password: string }
export type AuthorizationCreateResponseBody = { token: string }
export type AuthorizationCreateRequestHandler =
  RequestHandler<{}, AuthorizationCreateResponseBody, AuthorizationCreateRequestBody>

export type AuthorizationDeleteResponseBody = { success: true }
export type AuthorizationDeleteRequestHandler = RequestHandler<{}, AuthorizationDeleteResponseBody, {}>

export const authorizationCreateValidation = {
  body: Joi.object({
    email: joiRequiredEmail,
    password: joiRequiredPassword,
  }),
}
