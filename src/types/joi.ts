import { Joi } from 'express-validation'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Types

export const joiEmail = Joi
  .string()
  .email()
  .messages({
    'string.base': 'emailNotString',
    'string.empty': 'emailEmpty',
    'string.email': 'emailMalformed',
  })

export const joiPasswordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?])/
export const joiPassword = Joi
  .string()
  .min(8)
  .max(20)
  .regex(joiPasswordRegex)
  .messages({
    'string.base': 'passwordNotString',
    'string.empty': 'passwordEmpty',
    'string.min': 'passwordTooShort',
    'string.max': 'passwordTooLong',
    'string.pattern.base': 'passwordMalformed',
  })

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Validations

export const authorizationCreateSchema = {
  body: Joi.object({
    email: joiEmail.required().messages({ 'any.required': 'emailRequired' }),
    password: joiPassword.required().messages({ 'any.required': 'passwordRequired' }),
  }),
}
