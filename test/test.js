const { expect } = require('chai');

const server = require('../server.js')

describe('Calc function', () => {
  it('should return a*b', () => {
    const result = server.calc(2,2);
    console.log(result)
    expect(result).to.equal(4);
  });
});