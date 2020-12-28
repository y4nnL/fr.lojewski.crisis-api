import { APIError } from '@/types'
import { assert } from '@/utils/assert'

describe('assert util', () => {
  
  type Type = {
    value: any
    ok: boolean
    isObject: boolean
    isString: boolean
  }
  
  type Method = [ 'ok', 'isObject', 'isString' ]
  
  class MyClass {
  }
  
  const apiError500 = new APIError(500, 'Error')
  const methods: Method = [ 'ok', 'isObject', 'isString' ]
  const types: Type[] = [
    { value: [], ok: false, isObject: false, isString: true },
    { value: true, ok: false, isObject: true, isString: true },
    { value: false, ok: true, isObject: true, isString: true },
    { value: new MyClass(), ok: false, isObject: false, isString: true },
    { value: new Date(), ok: false, isObject: false, isString: true },
    { value: null, ok: true, isObject: true, isString: true },
    { value: 42, ok: false, isObject: true, isString: true },
    { value: 0, ok: true, isObject: true, isString: true },
    { value: {}, ok: false, isObject: false, isString: true },
    { value: /42/, ok: false, isObject: false, isString: true },
    { value: '42', ok: false, isObject: true, isString: false },
    { value: '0', ok: false, isObject: true, isString: false },
    { value: '', ok: true, isObject: true, isString: false },
    { value: Symbol(42), ok: false, isObject: true, isString: true },
    { value: Symbol(undefined), ok: false, isObject: true, isString: true },
    { value: undefined, ok: true, isObject: true, isString: true },
  ]
  
  methods.forEach((method) => {
    it('::' + method, () => {
      types.forEach((type) => {
        if (type[method]) {
          expect(() => assert[method](type.value)).toThrow('Assertion failed')
          expect(() => assert[method](type.value, apiError500)).toThrow(apiError500)
        } else {
          expect(() => assert[method](type.value)).not.toThrow()
        }
      })
    })
  })
  
})
