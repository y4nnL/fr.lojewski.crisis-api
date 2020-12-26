import { ErrorId } from '@/types'
import { Joi } from 'express-validation'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Types

export const joiRequiredEmail =
  Joi
    .string()
    .required()
    .email()
    .messages({
      'any.required': ErrorId.EmailRequired,
      'string.email': ErrorId.EmailMalformed,
    })

export const joiRequiredPassword =
  Joi
    .string()
    .required()
    .regex(/[a-zA-Z0-9]{8,30}/)
    .messages({
      'any.required': ErrorId.PasswordRequired,
      'string.pattern.base': ErrorId.PasswordMalformed,
    })

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Validations

export const authorizationCreateValidation = {
  body: Joi.object({
    email: joiRequiredEmail,
    password: joiRequiredPassword,
  }),
}
