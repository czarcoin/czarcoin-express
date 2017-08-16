const assert = require('assert'); 
const sinon = require('sinon');
const middleware = require('..');

describe('storj-express', function () {
  beforeEach(function () {
    this.sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    this.sandbox.restore()
  })

  describe('storj()', function () {
    beforeEach(function () {
      // declare a spy on every function in middleware
      Object.keys(middleware).forEach(function (key) {
        if (typeof middleware[key] === 'function') {
          this.sandbox.spy(middleware, key)
        }
      }.bind(this))
    })

    it('sets up options', function () {
      middleware();

    })
  })
})