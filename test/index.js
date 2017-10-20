const assert = require('assert');
const sinon = require('sinon');
const lib = require('..');

describe('storj-express', function () {
  beforeEach(function () {
    this.sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    this.sandbox.restore()
  })

  describe('storj()', function () {
    beforeEach(function () {
      // declare a spy on every function in lib
      Object.keys(lib).forEach(function (key) {
        if (typeof lib[key] === 'function') {
          this.sandbox.spy(lib, key)
        }
      }.bind(this))
    });
  });
});
