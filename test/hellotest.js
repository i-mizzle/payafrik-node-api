var assert = require('assert');
describe('Basic Mocha String Test', function () {
  it('should return number of charachters is 5', function () {
    assert.equal("Hello".length, 5);
  });
});