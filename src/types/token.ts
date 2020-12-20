import { Joi } from 'express-validation'
import { joiRequiredEmail, joiRequiredPassword } from '@/types'
import { RequestHandler } from 'express'

export enum TokenDuration {
  Authorization = '1w'
}

export enum TokenType {
  Authorization = 'authorization'
}

export namespace authorization {
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Request handlers
  
  export type CreateRequestBody = { email: string, password: string }
  export type CreateResponseBody = { token: string }
  export type CreateRequestHandler = RequestHandler<{}, CreateResponseBody, CreateRequestBody>
  
  export type DeleteResponseBody = { success: true }
  export type DeleteRequestHandler = RequestHandler<{}, DeleteResponseBody, {}>
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Validations
  
  export const createValidation = {
    body: Joi.object({
      email: joiRequiredEmail,
      password: joiRequiredPassword,
    }),
  }
  
}
