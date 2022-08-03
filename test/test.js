const chai = require('chai')
const chaiaspromised = require('chai-as-promised')
expect = chai.expect
chai.use(chaiaspromised)

const axios = require('axios')
const server = require('../server.js')
const database = require('../Database/users.js')

describe('Calc function', () => {
    it('should return a*b', () => {
        const result = server.calc(2, 2)
        expect(result).to.equal(4)
    })
})

//DATABASE
describe('Database functions', () => {
    const user_info = { id: 'ADMIN_ID', username: 'ADMIN_USERNAME', oAuth: 'oAUTH_STRING' }
    it('Should add user to MongoDB.', () => {
        return expect(database.init_user(user_info.id, user_info.username, user_info.oAuth)).to.eventually.contain({
            id: user_info.id,
            username: user_info.username,
            oAuth: user_info.oAuth,
        })
    })
    it('Should get user from MongoDB.', () => {
        return expect(database.get_user_by_id(user_info.id)).to.eventually.have.length.above(0)
    })
    it('Should delete user from MongoDB.', () => {
        let type = 'delete'
        return expect(database.update_user(user_info.id, type)).to.eventually.contain({ deletedCount: 1 })
    })
    it('Should ')
})

//SPOTIFY
let token =
    'BQBnHWq7kesLVAsH1Gpm_OQQlvYsqUgcyB0pHE6Ka4CGsVJc-Gjq0wyAh6Q5lGIVc8nBvr5mwdoJDzPUbaZlC5Hy3doanf0tSpVzpXltfGgWxyvnXkji5Gf8JMKiBviQZqjoHGnj7lxFKoQHs-fwpxivduXfx850MYeK3c52xm127TQd49f9ZBoy3BRloglh8kJINYGhxg_kN04y8tcBijBpwG2XXX97XPD3POzES1MpL6MEyCQ9yd2PtN2ZDw2VTA' //REQUIRED
describe('Spotify endpoint tests', () => {
    it('Should get user info.', () => {
        const fetching = () => {
            return new Promise((resolve, reject) => {
                axios('https://api.spotify.com/v1/me', {
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json',
                    },
                }).then((response) => {
                    resolve(response.data)
                    reject(err)
                })
            })
        }
        return expect(fetching()).to.eventually.contain({ display_name: 'felle21' })
    })

    it('Should get playlist info.', () => {
        const fetching = () => {
            return new Promise((resolve, reject) => {
                axios('https://api.spotify.com/v1/playlists/19S5kN779akXA6ySIZM2ve', {
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json',
                    },
                }).then((response) => {
                    resolve(response.data.name)
                    reject(err)
                })
            })
        }
        return expect(fetching()).to.eventually.equal('Study')
    })

    it('Should get Available Devices.', () => {
        const fetching = () => {
            return new Promise((resolve, reject) => {
                axios('https://api.spotify.com/v1/me/player/devices', {
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json',
                    },
                }).then((response) => {
                    resolve(response.data)
                    reject(err)
                })
            })
        }
        return expect(fetching()).to.eventually.not.be.an('undefined')
    })
})

//ADD TESTS FOR RECOMMENDED PLAYLISTS
