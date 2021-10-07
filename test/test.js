const chai = require('chai');
const chaiaspromised = require('chai-as-promised');
expect = chai.expect;
chai.use(chaiaspromised);

const axios = require('axios');
const server = require('../server.js');
const database = require('../Database/users.js');

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
  it('Should delete user from MongoDB.', () => {
    let type = 'delete';
    return expect(database.update_user(user_info.id, type)).to.eventually.contain({deletedCount:1})
  });
});

//SPOTIFY
let token = 'BQAj5Y1tKEhlszWTVJkoUVX9jIVulgdyYaNXF8ST30UY9_r5IG_a2cJRs1BqtdndyVoiEogn2k_ia_-IHOl3VJZ6I53-9N6icoJxQjYLJayefTXPUR2EJARvscFXqr2VCQ4DUntx0bhVCwGX2Vn1-vI0IHoljkoLkGSFxwyGCo9YxMzN3gthO4qw_ar6q3Z482t47GfsmVJ8gx6sZEwJSu6Buv_oylcxD5oCaPxfvJN96XRLTpkuikMcdtfjna7Vsw'; //REQUIRED
describe('Spotify endpoint tests', () => {
  it('Should get user info.', () => {
    const fetching = () => {
      return new Promise((resolve, reject) => {
        axios("https://api.spotify.com/v1/me", {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          }
        })
          .then((response) => {
            resolve(response.data)
            reject(err)
          })
      })
    }
    return expect(fetching()).to.eventually.contain({display_name:'felle21'})
  })

  it('Should get playlist info.', () => {
    const fetching = () => {
      return new Promise((resolve, reject) => {
        axios("https://api.spotify.com/v1/playlists/19S5kN779akXA6ySIZM2ve", {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          }
        })
          .then((response) => {
            resolve(response.data.name)
            reject(err)
          })
      })
    }
    return expect(fetching()).to.eventually.equal('Study')
  })
})