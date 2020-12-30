import { ErrorId } from '@/types'
import { Joi } from 'express-validation'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Types

export const joiEmail = Joi
  .string()
  .email()
  .messages({
    'string.base': ErrorId.EmailNotString,
    'string.empty': ErrorId.EmailEmpty,
    'string.email': ErrorId.EmailMalformed,
  })

export const joiPasswordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?])/
export const joiPassword = Joi
  .string()
  .required()
  .min(8)
  .max(20)
  .regex(joiPasswordRegex)
  .messages({
    'string.base': ErrorId.PasswordNotString,
    'string.empty': ErrorId.PasswordEmpty,
    'string.min': ErrorId.PasswordTooShort,
    'string.max': ErrorId.PasswordTooLong,
    'string.pattern.base': ErrorId.PasswordMalformed,
  })

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Validations

export const authorizationCreateSchema = {
  body: Joi.object({
    email: joiEmail.required().messages({ 'any.required': ErrorId.EmailRequired }),
    password: joiPassword.required().messages({ 'any.required': ErrorId.PasswordRequired }),
  }),
}
