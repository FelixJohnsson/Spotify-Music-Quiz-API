var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var debug = require('./debugging.js');
var DB_users = require('./Database/users.js');
var DB_playlists = require('./Database/playlists.js');
var DB_rooms = require('./Database/rooms.js');
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
    .use(bodyParser.urlencoded({
    extended: false
}))
    .use(bodyParser.json());
var server = app.listen(process.env.PORT, function () {
    debug.print_success_status('Connected to: ' + process.env.PORT);
});
exports.name = server;
var sockets = require('./sockets.js');
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
var options = { /* ... */};
var io = require('socket.io')(server, options);
io.on('connection', function (socket) { return __awaiter(_this, void 0, void 0, function () {
    var room;
    return __generator(this, function (_a) {
        debug.print_connection_established('CONNECTION');
        room = socket.handshake.headers.referer.split('/')[4];
        console.log('Room: ' + room);
        socket.on('ID', function (ID) {
            console.log("Connected with ID: " + ID);
        });
        return [2 /*return*/];
    });
}); });
app.get('/room/:id', function (req, res) {
    res.sendFile(__dirname + '/socket_test.html');
});
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
            res.send(create_error_object(400, 'Error', err));
        });
    }
    else {
        console.log('ERROR');
    }
});
app.get('/get_recommended', function (req, res) {
    DB_playlists.get_recommended()
        .then(function (data) {
        res.send(create_success_object(200, data));
    })["catch"](function (err) {
        res.send(create_error_object(400, "Can't find recommended playlists.", err));
    });
});
app.post('/save_recommended', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var URI;
    return __generator(this, function (_a) {
        URI = req.body.URI;
        DB_playlists.search_recommended(URI)
            .then(function (data) {
            if (data.length > 0) {
                res.send(create_error_object(400, "That playlist already exists in recommended."));
            }
            else {
                axios("https://api.spotify.com/v1/playlists/" + URI, {
                    headers: {
                        Accept: "application/json",
                        Authorization: "Bearer " + req.body.token,
                        "Content-Type": "application/json"
                    }
                })
                    .then(function (playlist_object) {
                    DB_playlists.add_recommended(playlist_object.data)
                        .then(function (data) { return res.send(create_success_object(200, data)); });
                })["catch"](function (err) {
                    res.send(create_error_object(400, "Can't add recommended playlists.", err));
                });
            }
        });
        return [2 /*return*/];
    });
}); });
app.post('/init_new_room', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var playlist_URI, token, user_id;
    return __generator(this, function (_a) {
        playlist_URI = req.body.URI;
        token = req.body.token;
        user_id = req.body.id;
        axios("https://api.spotify.com/v1/playlists/" + playlist_URI, {
            headers: {
                Accept: "application/json",
                Authorization: "Bearer " + token,
                "Content-Type": "application/json"
            }
        })
            .then(function (data) {
            DB_rooms.create_new_room(data.data, user_id)
                .then(function (data) { return res.send(create_success_object(200, data)); });
        })["catch"](function (err) { return res.send(create_error_object(400, "Can't find that playlist or your token has expired.", err)); });
        return [2 /*return*/];
    });
}); });
app.post('/update_room', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var token, user_id, room_id, type, value;
    return __generator(this, function (_a) {
        token = req.body.token;
        user_id = req.body.id;
        room_id = req.body.room_id;
        type = req.body.type;
        value = req.body.value;
        DB_rooms.update_room(room_id, type, value)
            .then(function (data) {
            if (data.length > 0) {
                res.send(create_success_object(200, data[0]));
            }
            else {
                res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
            }
        });
        return [2 /*return*/];
    });
}); });
app.post('/remove_player', function (req, res) {
    var user_id = req.body.id;
    var room_id = req.body.room_id;
    DB_rooms.remove_player(room_id, user_id)
        .then(function (data) {
        if (data.length > 0) {
            res.send(create_success_object(200, data[0]));
        }
        else {
            res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
        }
    })["catch"](function (err) { return console.log(err); });
});
app.post('/add_player', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var user_id, room_id, player_object, room_object, in_room;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user_id = req.body.id;
                room_id = req.body.room_id;
                return [4 /*yield*/, DB_users.get_user_by_id(user_id)];
            case 1:
                player_object = _a.sent();
                return [4 /*yield*/, DB_rooms.get_room(room_id)];
            case 2:
                room_object = _a.sent();
                in_room = room_object[0].players.find(function (el) { return el.id === user_id; });
                if (in_room === undefined) {
                    DB_rooms.add_player(room_id, player_object)
                        .then(function (data) {
                        if (data.length > 0) {
                            res.send(create_success_object(200, data[0]));
                        }
                        else {
                            res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
                        }
                    });
                }
                else {
                    res.send(create_error_object(300, "A user with that ID is already in this room."));
                }
                return [2 /*return*/];
        }
    });
}); });
app.get('/get_room/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var room_id;
    return __generator(this, function (_a) {
        room_id = parseInt(req.params.id);
        if (Number.isInteger(room_id)) {
            DB_rooms.get_room(req.params.id)
                .then(function (data) {
                if (data.length > 0) {
                    res.send(create_success_object(200, data));
                }
                else {
                    res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
                }
            });
        }
        else {
            res.send(create_error_object(401, "Room ID isn't a number."));
        }
        return [2 /*return*/];
    });
}); });
app.get('/delete_room/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var room_id;
    return __generator(this, function (_a) {
        room_id = parseInt(req.params.id);
        if (Number.isInteger(room_id)) {
            DB_rooms.delete_room(req.params.id)
                .then(function (data) {
                if (data.deletedCount === 1) {
                    res.send(create_success_object(200, { msg: 'Deleted.', data: data }));
                }
                else {
                    res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
                }
            });
        }
        else {
            res.send(create_error_object(401, "Room ID isn't a number."));
        }
        return [2 /*return*/];
    });
}); });
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
    const refresh_token = req.params.token;
    const authOptions = {
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
                const access_token = body.access_token;
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
