import nodeAssert from 'assert'

/**
 * The reason why this file exists if because node assert module throws an assert.AssertionError
 * We do want our error instances to be thrown instead
 */

const _try = (fn: Function, error?: Error) => {
  try {
    fn()
  } catch (e) {
    throw error ?? 'Assertion failed'
  }
}

function assert(value: any, error?: Error): asserts value {
  _try(() => nodeAssert(value), error)
}

namespace assert {
  
  export function ok(value: any, error?: Error): asserts value {
    assert(value, error)
  }
  export function strictEqual<T>(value: any, match: T, error?: Error): asserts value is T {
    _try(() => nodeAssert.strictEqual(value, match), error)
  }
  export function isObject(value: any, error?: Error): asserts value is object {
    _try(() => nodeAssert(value && typeof value === 'object'), error)
  }
  export function isString(value: any, error?: Error): asserts value is string {
    _try(() => nodeAssert(typeof value === 'string'), error)
  }
  
}

export default assert
