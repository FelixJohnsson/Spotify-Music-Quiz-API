//@ts-ignore
var mongoose = require('mongoose');
var user_schema = new mongoose.Schema({
    username: String,
    password: String,
    latest_login: String,
    login_token: String,
    played_playlists: Array
});
var user_model = mongoose.model('users', user_schema);
var add_new_user = function (user_object) {
    var new_user = new user_model({
        username: user_object.username,
        password: user_object.password,
        latest_login: user_object.latest_login,
        login_token: user_object.login_token,
        played_playlists: user_object.played_playlists
    });
    return new Promise(function (resolve) {
        new_user.save({}, function (error, success) {
            if (error)
                resolve(error);
            if (success)
                resolve(success);
        });
    });
};
module.exports = {
    add_new_user: add_new_user
};
