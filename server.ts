const debug = require('./debugging.js');

const DB_users = require('./Database/users.js');
const DB_playlists = require('./Database/playlists.js');
const DB_rooms = require('./Database/rooms.js');

const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const querystring = require('querystring');
const request = require('request');
const ss = require("string-similarity");
const {
	v4: uuid_v4
} = require('uuid');
const axios = require('axios');

//DATABASE - MongoDB & Mongoose
//@ts-ignore
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then((res: any) => {
		debug.print_success_status('Connected to MongoDB.');
	})
	.catch((err: any) => debug.print_error_status('Failed to connect to MongoDB.'))

//SERVER -  Express
const express = require('express');
const router = express.Router();
const app = require('express')();
const bodyParser = require('body-parser');
app.use(express.static("public"))
	.use(cors())
	.use(cookieParser())
	.use(bodyParser.urlencoded({
		extended: false
	}))
	.use(bodyParser.json());

const server = app.listen(process.env.PORT, () => {
	debug.print_success_status('Connected to: ' + process.env.PORT);
	
});

interface New_user {
	username: string,
		id: string,
		password: string,
		latest_login_string: string,
		latest_login_number: number,
		login_token: string,
		played_playlists: string[],
		uuid: string
}
interface Error_object {
	statusCode: Number,
		error_message: String,
		content: Object,
}
interface Success_object {
	statusCode: Number,
		content: Object,
}

const create_error_object = (statusCode: Number = 400, error_message: String, content ? : any) => {
	let error_object: Error_object = {
		statusCode: statusCode,
		error_message: error_message,
		content: content
	}
	return error_object;
}
const create_success_object = (statusCode: Number = 200, content: any) => {
	let success_object: Success_object = {
		statusCode: statusCode,
		content: content
	}
	return success_object;
}
const options = {  
	cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["room_id"],
    credentials: true
  }};
const io = require('socket.io')(server, options);

io.on('connection', async (socket:any) => {
	const room:string = socket.handshake.headers['room_id'];
	socket.join(room);
    debug.print_connection_established('CONNECTION in ROOM ' + room);

	socket.on('Display name', display_name => {
		console.log(`Connected with name: ${display_name}`)
	})
	socket.on('msg', object => {
		const newObject = {
			display_name: object.display_name, 
			msg: object.msg,
			uuid:uuid_v4()
		}
		console.log('send message')
		io.to(room).emit('msg', newObject);
	})
})


app.get('/room/:id', (req:any, res:any) => {
	res.sendFile(__dirname + '/socket_test.html');
})

app.post('/add_user', (req: any, res: any) => {
	if (req.body.username != undefined && req.body.username.length > 0) {
		DB_users.init_user(req.body.id, req.body.username, uuid_v4())
			.then(data => {
				res.send(create_success_object(200, data))
				debug.print_success_status(`Added user ${data.username}`);
			})
	} else {
		res.send(create_error_object(400, "Couldn't add user, insufficient data received."));
		debug.print_error_status(`Failed to add user.`);
	}
});

app.get('/get_user/:id', (req: any, res: any) => {
	DB_users.get_user_by_id(req.params.id)
		.then(data => {
			if(data.length === 0){
				res.send(create_error_object(400, "Couldn't find that user."));
			} else {
				res.send(create_success_object(200, data[0]))
				debug.print_general_status(`Found user ${req.params.id}`);
			}
		})
});

app.get('/logged_in/:data', (req: any, res: any) => {
	const data = req.params.data.split('&');
	let user_info = {
		access_token: data[0].split('=')[1],
		refresh_token: data[1].split('=')[1],
		id: data[2].split('=')[1],
		username: data[3].split('=')[1],
		oAuth: uuid_v4()
	}
	DB_users.update_user(user_info.id, 'login', user_info.oAuth);
	res.send(create_success_object(200, data));
	debug.print_general_status(`Logged in user ${'ADMIN'}`);
});

app.post('/update_user', (req: any, res: any) => {
	const array_of_types = ['delete', 'login', 'join_room', 'correct_guess', 'incorrect_guess', 'rooms_won', 'rooms_lost', 'new_badge', 'socket_change'];
	if (req.body.type === 'login') {
		req.body.value = uuid_v4()
	}
	if (array_of_types.includes(req.body.type) && req.body.id.length > 0) {
		DB_users.update_user(req.body.id, req.body.type, req.body.value)
			.then(data => {
				res.send(create_success_object(200, data))
			})
			.catch(err => {
				res.send(create_error_object(400, 'Error', err))
			})
	} else {
		console.log('ERROR')
	}
});

app.get('/get_recommended', (req: any, res: any) => {

	DB_playlists.get_recommended()
		.then((data: object[]) => {
			res.send(create_success_object(200, data))
		})
		.catch((err: any) => {
			res.send(create_error_object(400, "Can't find recommended playlists.", err))
		})
})

app.post('/save_recommended', async (req: any, res: any) => {
	const URI = req.body.URI;
	const token = req.body.token;
	DB_playlists.search_recommended(URI)
		.then(data => {
			if (data.length > 0) {
				res.send(create_error_object(400, "That playlist already exists in recommended."))
			} else {
				axios(`https://api.spotify.com/v1/playlists/${URI}`, {
						headers: {
							Accept: "application/json",
							Authorization: "Bearer " + token,
							"Content-Type": "application/json"
						}
					})
					.then((playlist_object: any) => {
						DB_playlists.add_recommended(playlist_object.data)
						.then(data => res.send(create_success_object(200, data))); 
					})
					.catch((err: any) => {
						res.send(create_error_object(400, "Can't add recommended playlists.", err))
					})
			}
		})
})

app.post('/init_new_room', async (req:any, res:any) => {
	const playlist_URI = req.body.URI;
	const token = req.body.token;
	const user_id = req.body.id;

	axios(`https://api.spotify.com/v1/playlists/${playlist_URI}`,{
		headers: {
			Accept: "application/json",
			Authorization: "Bearer " + token,
			"Content-Type": "application/json"
		  }
	})
	.then(data => {
		DB_rooms.create_new_room(data.data, user_id)
		.then(data => {
			res.send(create_success_object(200, data))
		})
	})
	.catch(err => res.send(create_error_object(400, "Can't find that playlist or your token has expired.", err)))
})

app.post('/update_room', async (req:any, res:any) => {
	const token = req.body.token;
	const user_id = req.body.id;
	const room_id = req.body.room_id;
	const type = req.body.type;
	const value = req.body.value;
	DB_rooms.update_room(room_id, type, value)
	.then(data => {
		if(data.length > 0){
			res.send(create_success_object(200, data[0]));
		} else {
			res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
		}
	})
})

app.post('/remove_player', (req:any, res:any) => {
	const user_id = req.body.id;
	const room_id = req.body.room_id;
	DB_rooms.remove_player(room_id, user_id)
	.then(data => {
		if(data.length > 0){
			res.send(create_success_object(200, data[0]));
		} else {
			res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
		}
	})
	.catch(err => console.log(err))
})
app.post('/add_player', async (req:any, res:any) => {
	const user_id = req.body.id;
	const room_id = req.body.room_id;
	const player_object = await DB_users.get_user_by_id(user_id);
	const room_object = await DB_rooms.get_room(room_id);
	const in_room = room_object[0].players.find(el => el.id === user_id);
	if(in_room === undefined){
		DB_rooms.add_player(room_id, player_object)
		.then(data => {
			if(data.length > 0){
				res.send(create_success_object(200, data[0]));
			} else {
				res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
			}
		})
	} else {
		res.send(create_error_object(300, "A user with that ID is already in this room."));
	}
})

app.get('/get_room/:id', async (req:any, res:any) => {
	const room_id = parseInt(req.params.id);
	if(Number.isInteger(room_id)){
		DB_rooms.get_room(req.params.id)
		.then(data => {
			if(data.length > 0){
				res.send(create_success_object(200, data));
			} else {
				res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
			}
		})
	} else {
		res.send(create_error_object(401, "Room ID isn't a number."))
	}
})
app.get('/delete_room/:id', async (req:any, res:any) => {
	const room_id = parseInt(req.params.id);
	if(Number.isInteger(room_id)){
		DB_rooms.delete_room(req.params.id)
		.then(data => {
			if(data.deletedCount === 1){
				res.send(create_success_object(200, {msg: 'Deleted.', data},));
			} else {
				res.send(create_error_object(400, "That room doesn't exist, maybe closed?"));
			}
		})
	} else {
		res.send(create_error_object(401, "Room ID isn't a number."))
	}
})


const spotify = require('./spotify_functions.js')
// SPOTIFY - Functions
const client_id = '94ac88d39834494da4f490e1b0cb0ef2'; // Your client id
const client_secret = '9b029b88d0364f1590456f0e2f11dd5c'; // Your secret
const redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri
const stateKey = 'spotify_auth_state';

app.get('/login', function (req: Request, res: any) {

	const state = spotify.generateRandomString(16);
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
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		}));
});


app.get('/callback', (req: any, res: any): void => {

	// your application requests refresh and access tokens
	// after checking the state parameter

	const code = req.query.code || null;
	const state = req.query.state || null;
	const storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	} else {
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

		request.post(authOptions, (error: any, response: any, body: any) => {
			if (!error && response.statusCode === 200) {


				let access_token = body.access_token,
					refresh_token = body.refresh_token;

				// we can also pass the token to the browser to make requests from there
				axios("https://api.spotify.com/v1/me", {
						headers: {
							Accept: "application/json",
							Authorization: "Bearer " + access_token,
							"Content-Type": "application/json"
						}
					})
					.then((response) => {
						res.redirect('http://localhost:3000/logged_in/' +
							querystring.stringify({
								access_token: access_token,
								refresh_token: refresh_token,
								id: response.data.id,
								username: response.data.display_name
							}));
						debug.print_success_login('User successfully logged in');
					})
					.catch(() => debug.print_error_login('User unsuccessfully logged in'))
			} else {
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
