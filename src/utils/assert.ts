import nodeAssert from 'assert'

/**
 * The reason why this file exists if because node assert module throws an assert.AssertionError
 * We do want our error instances to be thrown instead
 */

function assert(value: any, error: Error): asserts value {
  try {
    nodeAssert(value)
  } catch (e) {
    throw error
  }
}

namespace assert {
  export const ok = (value: any, error: Error): asserts value => assert(value, error)
}

export default assert
