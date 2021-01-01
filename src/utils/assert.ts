import nodeAssert from 'assert'

/**
 * The reason why this file exists if because node assert module throws an assert.AssertionError
 * We do want our error instances to be thrown instead
 */

interface Assert {
  ok(value: any, error?: Error): asserts value
  isNull(value: any, error?: Error): asserts value is null
  isObject(value: any, error?: Error): asserts value is object
  isString(value: any, error?: Error): asserts value is string
}

const _try = (fn: Function, error?: Error) => {
  try {
    fn()
  } catch (e) {
    throw error ?? 'Assertion failed'
  }
}

const assert: Assert = {
  ok(value: any, error?: Error): asserts value {
    _try(() => nodeAssert(value), error)
  },
  isNull(value: any, error?: Error): asserts value is null {
    _try(() => nodeAssert(value === null), error)
  },
  isObject(value: any, error?: Error): asserts value is object {
    _try(() => nodeAssert(value !== null && typeof value === 'object'), error)
  },
  isString(value: any, error?: Error): asserts value is string {
    _try(() => nodeAssert(typeof value === 'string'), error)
  },
}

export { assert }
export default assert.ok
