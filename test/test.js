const chai = require('chai');
const chaiaspromised = require('chai-as-promised');
expect = chai.expect;
chai.use(chaiaspromised);

const server = require('../server.js')
const database = require('../Database/users.js')

describe('Calc function', () => {
  it('should return a*b', () => {
    const result = server.calc(2,2);
    expect(result).to.equal(4);
  });
});


//DATABASE
describe('Database functions', () => {
  const user_info = {id: 'ADMIN_ID', username: 'ADMIN_USERNAME', oAuth:'oAUTH_STRING'}
  it('Should add user to MongoDB.', () => {
    return expect(database.init_user(user_info.id, user_info.username, user_info.oAuth)).to.eventually.contain({id: user_info.id, username:user_info.username,  oAuth: user_info.oAuth})
  });
  it('Should get user from MongoDB.', () => {
    return expect(database.get_user_by_id(user_info.id)).to.eventually.have.length.above(0);
  });
});