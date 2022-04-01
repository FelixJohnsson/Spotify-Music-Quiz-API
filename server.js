"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debugging_1 = __importDefault(require("./debugging"));
const users_js_1 = __importDefault(require("./Database/users.js"));
const playlists_js_1 = __importDefault(require("./Database/playlists.js"));
const rooms_js_1 = __importDefault(require("./Database/rooms.js"));
const spotify_functions_js_1 = __importDefault(require("./spotify_functions.js"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require('dotenv').config();
const querystring_1 = __importDefault(require("querystring"));
const request_1 = __importDefault(require("request"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
//DATABASE - MongoDB & Mongoose
//@ts-ignore
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
    debugging_1.default.print_success_status('Connected to MongoDB.');
})
    .catch((err) => {
    debugging_1.default.print_error_status('Failed to connect to MongoDB.');
    debugging_1.default.print_error_status(err);
});
//SERVER -  Express
const express_1 = __importDefault(require("express"));
express_1.default.Router();
const app = require('express')();
const body_parser_1 = __importDefault(require("body-parser"));
app.use(express_1.default.static("public"))
    .use((0, cors_1.default)())
    .use((0, cookie_parser_1.default)())
    .use(body_parser_1.default.urlencoded({
    extended: false
}))
    .use(body_parser_1.default.json());
const server = app.listen(process.env.PORT, () => {
    debugging_1.default.print_success_status('Connected to: ' + process.env.PORT);
});
const create_error_object = (statusCode = 400, error_message, content) => {
    let error_object = {
        statusCode: statusCode,
        error_message: error_message,
        content: content
    };
    return error_object;
};
const create_success_object = (statusCode = 200, content) => {
    let success_object = {
        statusCode: statusCode,
        content: content
    };
    return success_object;
};
const options = {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["room_id"],
        credentials: true
    }
};
const io = require('socket.io')(server, options);
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    const room = socket.handshake.headers['room_id'];
    socket.join(room);
    debugging_1.default.print_connection_established('CONNECTION in ROOM ' + room);
    socket.on('Display name', (display_name) => {
        console.log(`Connected with name: ${display_name}`);
    });
    socket.on('msg', (object) => {
        const newObject = {
            display_name: object.display_name,
            msg: object.msg,
            uuid: (0, uuid_1.v4)()
        };
        console.log('send message');
        io.to(room).emit('msg', newObject);
    });
}));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/api_docs.html');
});
app.get('/room/:id', (req, res) => {
    res.sendFile(__dirname + '/socket_test.html');
});
app.post('/add_user', (req, res) => {
    if (req.body.username != undefined && req.body.username.length > 0) {
        users_js_1.default.init_user(req.body.id, req.body.username, (0, uuid_1.v4)())
            .then((data) => {
            res.send(create_success_object(200, data));
            debugging_1.default.print_success_status(`Added user ${data.username}`);
        });
    }
    else {
        res.send(create_error_object(400, "Couldn't add user, insufficient data received."));
        debugging_1.default.print_error_status(`Failed to add user.`);
    }
});
app.get('/get_user/:id', (req, res) => {
    users_js_1.default.get_user_by_id(req.params.id)
        .then((data) => {
        if (data.length === 0) {
            res.send(create_error_object(400, "Couldn't find that user."));
        }
        else {
            res.send(create_success_object(200, data[0]));
            debugging_1.default.print_general_status(`Found user ${req.params.id}`);
        }
    });
});
app.get('/logged_in/:data', (req, res) => {
    const data = req.params.data.split('&');
    let user_info = {
        access_token: data[0].split('=')[1],
        refresh_token: data[1].split('=')[1],
        id: data[2].split('=')[1],
        username: data[3].split('=')[1],
        oAuth: (0, uuid_1.v4)()
    };
    users_js_1.default.update_user(user_info.id, 'login', user_info.oAuth);
    res.send(create_success_object(200, data));
    debugging_1.default.print_general_status(`Logged in user ${'ADMIN'}`);
});
app.post('/update_user', (req, res) => {
    const array_of_types = ['delete', 'login', 'join_room', 'correct_guess', 'incorrect_guess', 'rooms_won', 'rooms_lost', 'new_badge', 'socket_change'];
    if (req.body.type === 'login') {
        req.body.value = (0, uuid_1.v4)();
    }
    if (array_of_types.includes(req.body.type) && req.body.id.length > 0) {
        users_js_1.default.update_user(req.body.id, req.body.type, req.body.value)
            .then((data) => {
            res.send(create_success_object(200, data));
        })
            .catch((err) => {
            res.send(create_error_object(400, 'Error', err));
        });
    }
    else {
        console.log('ERROR');
    }
});
app.get('/get_recommended', (req, res) => {
    playlists_js_1.default.get_recommended()
        .then((data) => {
        res.send(create_success_object(200, data));
    })
        .catch((err) => {
        res.send(create_error_object(400, "Can't find recommended playlists.", err));
    });
});
app.post('/save_recommended', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const URI = req.body.URI;
    const token = req.body.token;
    playlists_js_1.default.search_recommended(URI)
        .then((data) => {
        if (data.length > 0) {
            res.send(create_error_object(400, "That playlist already exists in recommended."));
        }
        else {
            (0, axios_1.default)(`https://api.spotify.com/v1/playlists/${URI}`, {
                headers: {
                    Accept: "application/json",
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json"
                }
            })
                .then((playlist_object) => {
                playlists_js_1.default.add_recommended(playlist_object.data)
                    .then((data) => res.send(create_success_object(200, data)));
            })
                .catch((err) => {
                res.send(create_error_object(400, "Can't add recommended playlists.", err));
            });
        }
    });
}));
app.post('/init_new_room', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const playlist_URI = req.body.URI;
    const token = req.body.token;
    const user_id = req.body.id;
    (0, axios_1.default)(`https://api.spotify.com/v1/playlists/${playlist_URI}`, {
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
        }
    })
        .then((data) => {
        rooms_js_1.default.create_new_room(data.data, user_id)
            .then((data) => {
            res.send(create_success_object(200, data));
        });
    })
        .catch((err) => res.send(create_error_object(400, "Can't find that playlist or your token has expired.", err)));
}));
app.post('/update_room', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token;
    const user_id = req.body.id;
    const room_id = req.body.room_id;
    const type = req.body.type;
    const value = req.body.value;
    rooms_js_1.default.update_room(room_id, type, value)
        .then((data) => {
        if (data.length > 0) {
            res.send(create_success_object(200, data[0]));
        }
        else {
            res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
        }
    });
}));
app.post('/remove_player', (req, res) => {
    const user_id = req.body.id;
    const room_id = req.body.room_id;
    rooms_js_1.default.remove_player(room_id, user_id)
        .then((data) => {
        if (data.length > 0) {
            res.send(create_success_object(200, data[0]));
        }
        else {
            res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
        }
    })
        .catch((err) => console.log(err));
});
app.post('/add_player', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.body.id;
    const room_id = req.body.room_id;
    const player_object = yield users_js_1.default.get_user_by_id(user_id);
    const room_object = yield rooms_js_1.default.get_room(room_id);
    const in_room = room_object[0].players.find((el) => el.id === user_id);
    if (in_room === undefined) {
        rooms_js_1.default.add_player(room_id, player_object)
            .then((data) => {
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
}));
app.get('/get_room/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const room_id = parseInt(req.params.id);
    if (Number.isInteger(room_id)) {
        rooms_js_1.default.get_room(req.params.id)
            .then((data) => {
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
}));
app.get('/delete_room/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const room_id = parseInt(req.params.id);
    if (Number.isInteger(room_id)) {
        rooms_js_1.default.delete_room(req.params.id)
            .then((data) => {
            if (data.deletedCount === 1) {
                res.send(create_success_object(200, { msg: 'Deleted.', data }));
            }
            else {
                res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
            }
        });
    }
    else {
        res.send(create_error_object(401, "Room ID isn't a number."));
    }
}));
// SPOTIFY - Functions
const client_id = '94ac88d39834494da4f490e1b0cb0ef2'; // Your client id
const client_secret = '9b029b88d0364f1590456f0e2f11dd5c'; // Your secret
const redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri
const stateKey = 'spotify_auth_state';
app.get('/login', function (req, res) {
    const state = spotify_functions_js_1.default.generateRandomString(16);
    res.cookie(stateKey, state);
    // your application requests authorization
    const scope = `playlist-modify-public 
				   playlist-modify-private 
				   playlist-read-private 
				   playlist-read-collaborative
				   user-library-modify
				   user-library-read
				   app-remote-control
				   user-read-currently-playing
				   user-modify-playback-state
				   user-read-playback-state
				   user-read-recently-played
				   user-top-read
				   user-read-playback-position`;
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring_1.default.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});
app.get('/callback', (req, res) => {
    // your application requests refresh and access tokens
    // after checking the state parameter
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;
    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring_1.default.stringify({
                error: 'state_mismatch'
            }));
    }
    else {
        res.clearCookie(stateKey);
        const authOptions = {
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
        request_1.default.post(authOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                let access_token = body.access_token, refresh_token = body.refresh_token;
                // we can also pass the token to the browser to make requests from there
                (0, axios_1.default)("https://api.spotify.com/v1/me", {
                    headers: {
                        Accept: "application/json",
                        Authorization: "Bearer " + access_token,
                        "Content-Type": "application/json"
                    }
                })
                    .then((response) => {
                    res.redirect('http://localhost:3000/logged_in/' +
                        querystring_1.default.stringify({
                            access_token: access_token,
                            refresh_token: refresh_token,
                            id: response.data.id,
                            username: response.data.display_name
                        }));
                    debugging_1.default.print_success_login('User successfully logged in');
                })
                    .catch(() => debugging_1.default.print_error_login('User unsuccessfully logged in'));
            }
            else {
                res.redirect('/#' +
                    querystring_1.default.stringify({
                        error: 'invalid_token'
                    }));
                debugging_1.default.print_error_login('User unsuccessfully logged in');
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
