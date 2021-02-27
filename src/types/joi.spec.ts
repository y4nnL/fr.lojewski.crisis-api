import * as joi from './joi'
import { omitTypes } from '~/helpers/utils'
import { joiPasswordRegex } from './joi'

describe('joi type', () => {
  
  it('::joiEmail', () => {
    Object.entries(omitTypes([ 'string', 'undefined' ]))
      .forEach(([ key, value ]) =>
        expect(joi.joiEmail.validate(value).error?.details[0].message).toStrictEqual('emailNotString'))
    expect(joi.joiEmail.validate('').error?.details[0].message).toStrictEqual('emailEmpty')
    expect(joi.joiEmail.validate('ko').error?.details[0].message).toStrictEqual('emailMalformed')
    expect(joi.joiEmail.validate('test@test.com')).toStrictEqual({ value: 'test@test.com' })
  })
  
  it('::joiPassword', () => {
    Object.entries(omitTypes([ 'string', 'undefined' ]))
      .forEach(([ key, value ]) =>
        expect(joi.joiPassword.validate(value).error?.details[0].message).toStrictEqual('passwordNotString'))
    expect(joi.joiPassword.validate('').error?.details[0].message).toStrictEqual('passwordEmpty')
    expect(joi.joiPassword.validate('01').error?.details[0].message).toStrictEqual('passwordTooShort')
    expect(joi.joiPassword.validate('012345678901234567890123456789').error?.details[0].message)
      .toStrictEqual('passwordTooLong')
    const specials = '-+_!@#$%^&*.,?'.split('')
    const chars = 'aA1'.split('')
    specials.forEach((special) => { chars.forEach((one) => { chars.forEach((two) => { chars.forEach((three) => {
      one != two && one != three && one != special && two != three && two != special && three != special ?
        expect(joiPasswordRegex.test(one + two + three + special)).toStrictEqual(true) :
        expect(joiPasswordRegex.test(one + two + three + special)).toStrictEqual(false)
    })})})})
    expect(joi.joiPassword.validate('aaaaaaaa').error?.details[0].message).toStrictEqual('passwordMalformed')
    expect(joi.joiPassword.validate('aA1!yeah')).toStrictEqual({ value: 'aA1!yeah' })
  })
  
  it('::authorizationCreateSchema', () => {
    const validation = joi.authorizationCreateSchema.body.validate({}, { abortEarly: false })
    expect(validation.error?.details[0].message).toStrictEqual('emailRequired')
    expect(validation.error?.details[1].message).toStrictEqual('passwordRequired')
  })
  
})
