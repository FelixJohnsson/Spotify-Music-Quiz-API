var debug = require('./debugging.js');
var DB_users = require('./Database/users.js');
var cors = require('cors');
var cookieParser = require('cookie-parser');
require('dotenv').config();
var querystring = require('querystring');
var request = require('request');
var ss = require("string-similarity");
var uuid_v4 = require('uuid').v4;
var axios = require('axios');
//DATABASE - MongoDB & Mongoose
//@ts-ignore
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(function (res) {
    debug.print_success_status('Connected to MongoDB.');
})["catch"](function (err) { return debug.print_error_status('Failed to connect to MongoDB.'); });
//SERVER -  Express
var express = require('express');
var router = express.Router();
var app = require('express')();
var bodyParser = require('body-parser');
app.use(express.static("public"))
    .use(cors())
    .use(cookieParser())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json());
var server = app.listen(process.env.PORT, function () {
    debug.print_success_status('Connected to: ' + process.env.PORT);
});
var create_error_object = function (statusCode, error_message, content) {
    if (statusCode === void 0) { statusCode = 400; }
    var error_object = {
        statusCode: statusCode,
        error_message: error_message,
        content: content
    };
    return error_object;
};
var create_success_object = function (statusCode, content) {
    if (statusCode === void 0) { statusCode = 200; }
    var success_object = {
        statusCode: statusCode,
        content: content
    };
    return success_object;
};
app.post('/add_user', function (req, res) {
    if (req.body.username != undefined && req.body.username.length > 0) {
        DB_users.init_user(req.body.id, req.body.username, uuid_v4())
            .then(function (data) {
            res.send(create_success_object(200, data));
            debug.print_success_status("Added user " + data.username);
        });
    }
    else {
        res.send(create_error_object(400, "Couldn't add user, insufficient data received."));
        debug.print_error_status("Failed to add user.");
    }
});
app.get('/get_user/:id', function (req, res) {
    DB_users.get_user_by_id(req.params.id)
        .then(function (data) {
        res.send(create_success_object(200, data[0]));
        debug.print_general_status("Found user " + req.params.id);
    });
});
app.get('/logged_in/:data', function (req, res) {
    var data = req.params.data.split('&');
    var user_info = {
        access_token: data[0].split('=')[1],
        refresh_token: data[1].split('=')[1],
        id: data[2].split('=')[1],
        username: data[3].split('=')[1],
        oAuth: uuid_v4()
    };
    DB_users.update_user(user_info.id, 'login', user_info.oAuth);
    res.send(create_success_object(200, data));
    debug.print_general_status("Logged in user " + 'ADMIN');
});
app.post('/update_user', function (req, res) {
    var array_of_types = ['delete', 'login', 'join_room', 'correct_guess', 'incorrect_guess', 'rooms_won', 'rooms_lost', 'new_badge', 'socket_change'];
    if (req.body.type === 'login') {
        req.body.value = uuid_v4();
    }
    if (array_of_types.includes(req.body.type) && req.body.id.length > 0) {
        DB_users.update_user(req.body.id, req.body.type, req.body.value)
            .then(function (data) {
            res.send(create_success_object(200, data));
        })["catch"](function (err) {
            res.send(create_error_object(200, 'Error', err));
        });
    }
    else {
        console.log('ERROR');
    }
});
var spotify = require('./spotify_functions.js');
// SPOTIFY - Functions
var client_id = '94ac88d39834494da4f490e1b0cb0ef2'; // Your client id
var client_secret = '9b029b88d0364f1590456f0e2f11dd5c'; // Your secret
var redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri
var stateKey = 'spotify_auth_state';
app.get('/login', function (req, res) {
    var state = spotify.generateRandomString(16);
    res.cookie(stateKey, state);
    // your application requests authorization
    var scope = "playlist-modify-public \n\t\t\t\t   playlist-modify-private \n\t\t\t\t   playlist-read-private \n\t\t\t\t   playlist-read-collaborative\n\t\t\t\t   user-library-modify\n\t\t\t\t   user-library-read\n\t\t\t\t   app-remote-control\n\t\t\t\t   user-read-currently-playing\n\t\t\t\t   user-modify-playback-state\n\t\t\t\t   user-read-playback-state\n\t\t\t\t   user-read-recently-played\n\t\t\t\t   user-top-read\n\t\t\t\t   user-read-playback-position";
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});
app.get('/callback', function (req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    }
    else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                // @ts-ignore  ??? - Only a void function can be called with the 'new' keyword.
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };
        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var access_token_1 = body.access_token, refresh_token_1 = body.refresh_token;
                // we can also pass the token to the browser to make requests from there
                axios("https://api.spotify.com/v1/me", {
                    headers: {
                        Accept: "application/json",
                        Authorization: "Bearer " + access_token_1,
                        "Content-Type": "application/json"
                    }
                })
                    .then(function (response) {
                    res.redirect('/logged_in/' +
                        querystring.stringify({
                            access_token: access_token_1,
                            refresh_token: refresh_token_1,
                            id: response.data.id,
                            username: response.data.display_name
                        }));
                    debug.print_success_login('User successfully logged in');
                })["catch"](function () { return debug.print_error_login('User unsuccessfully logged in'); });
            }
            else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
                debug.print_error_login('User unsuccessfully logged in');
            }
        });
    }
});
/*
app.get('/refresh_token/:token', (req:any, res:any) => {

    // requesting access token from refresh token
    var refresh_token = req.params.token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            //@ts-ignore
            'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error:String, response:any, body:any) {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token;
                res.send({
                    'access_token': access_token
                });
            } else {
                res.send(response)
            }
        })

});
*/
var calc = function (a, b) {
    return a * b;
};
module.exports = {
    calc: calc
};
