const LambdaTester = require('lambda-tester')
const GetPreparersFunction = require('../../src/functions/getPreparers')

describe('getPreparers', () => {
  it('should return a promise', () => {
    return LambdaTester(GetPreparersFunction)
      .expectResolve()
  })
})
