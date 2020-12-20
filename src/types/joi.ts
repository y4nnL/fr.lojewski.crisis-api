import { ErrorId } from '@/types/error'
import { Joi } from 'express-validation'

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
