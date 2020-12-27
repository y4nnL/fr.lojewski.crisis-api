import assert from '@/utils/assert'
import { APIError } from '@/types'

describe('assert util', () => {
  
  type Type = {
    value: any
    assert: boolean
    ok: boolean
    isObject: boolean
    isString: boolean
  }
  
  type Method = [ 'assert', 'ok', 'isObject', 'isString' ]
  
  class MyClass {
  }
  
  const apiError500 = new APIError(500, 'Error')
  const methods: Method = [ 'assert', 'ok', 'isObject', 'isString' ]
  const types: Type[] = [
    { value: [], assert: false, ok: false, isObject: false, isString: true },
    { value: true, assert: false, ok: false, isObject: true, isString: true },
    { value: false, assert: true, ok: true, isObject: true, isString: true },
    { value: new MyClass(), assert: false, ok: false, isObject: false, isString: true },
    { value: new Date(), assert: false, ok: false, isObject: false, isString: true },
    { value: null, assert: true, ok: true, isObject: true, isString: true },
    { value: 42, assert: false, ok: false, isObject: true, isString: true },
    { value: 0, assert: true, ok: true, isObject: true, isString: true },
    { value: {}, assert: false, ok: false, isObject: false, isString: true },
    { value: /42/, assert: false, ok: false, isObject: false, isString: true },
    { value: '42', assert: false, ok: false, isObject: true, isString: false },
    { value: '0', assert: false, ok: false, isObject: true, isString: false },
    { value: '', assert: true, ok: true, isObject: true, isString: false },
    { value: Symbol(42), assert: false, ok: false, isObject: true, isString: true },
    { value: Symbol(undefined), assert: false, ok: false, isObject: true, isString: true },
    { value: undefined, assert: true, ok: true, isObject: true, isString: true },
  ]
  
  methods.forEach((method) => {
    it('::' + method, () => {
      types.forEach((type) => {
        const assertMethod = method === 'assert' ? assert : assert[method]
        if (type[method]) {
          expect(() => assertMethod(type.value)).toThrow('Assertion failed')
          expect(() => assertMethod(type.value, apiError500)).toThrow(apiError500)
        } else {
          expect(() => assertMethod(type.value)).not.toThrow()
        }
      })
    })
  })
  
})
