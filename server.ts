const debug = require('./debugging.js')
const DB_users = require('./Database/users.js')

const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const querystring = require('querystring');
const request = require('request');
const ss = require("string-similarity");
const { v4: uuid_v4 } = require('uuid');

//DATABASE - MongoDB & Mongoose
//@ts-ignore
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then((res:any) => debug.print_success_status('Connected to MongoDB.')) 
.catch((err:any) => debug.print_error_status('Failed to connect to MongoDB.'))

//SERVER -  Express
const express = require('express');
const router = express.Router();
const app = require('express')();
const bodyParser = require('body-parser');
app.use(express.static("public"))
    .use(cors())
    .use(cookieParser())
	.use(bodyParser.urlencoded({ extended: false }))
	.use(bodyParser.json());

const server = app.listen(process.env.PORT, () => {
	debug.print_success_status('Connected to: ' + process.env.PORT);
});


interface New_user {
	username:string,
	id:string,
    password:string,
    latest_login_string:string,
	latest_login_number: number,
    login_token:string,
    played_playlists:string[],
	uuid:string
}
interface Error_object {
	statusCode:Number,
	error_message:String,
	content:Object,
}
interface Success_object {
	statusCode:Number,
	content:Object,
}

app.post('/add_user', (req:any, res:any) => {
	if(req.body.username != undefined && req.body.username.length > 0){
		DB_users.init_user(req.body.username,  req.body.id, uuid_v4())
		.then(data => {
			let success_object:Success_object = {
				statusCode: 200,
				content: data
			}
			res.send(success_object)
			debug.print_success_status(`Added user ${data.username}`);
		})
	} else {
		let error_object:Error_object = {
			statusCode: 400,
			error_message: "Couldn't add user, insufficient data reievied.",
			content:{}
		}
		res.send(error_object)
		debug.print_error_status(`Failed to add user.`);
	}

});
app.get('/get_user/:id', (req:any, res:any) => {
	DB_users.get_user_by_id(req.params.id)
	.then(data => {
		res.send({data});
		debug.print_general_status(`Found user ${req.params.id}`);
	})
});







const spotify = require('./spotify_functions.js')
// SPOTIFY - Functions
const client_id = '94ac88d39834494da4f490e1b0cb0ef2'; // Your client id
const client_secret = '9b029b88d0364f1590456f0e2f11dd5c'; // Your secret
const redirect_uri = 'http://localhost:5000/callback'; // Your redirect uri
const stateKey = 'spotify_auth_state';

app.get('/login', function (req: Request, res:any) {

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


app.get('/callback', (req:any, res:any):void => {

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
	} else {
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

		request.post(authOptions, (error:any, response:any, body:any) => {
			if (!error && response.statusCode === 200) {

				var access_token = body.access_token,
				refresh_token = body.refresh_token;

			
				// we can also pass the token to the browser to make requests from there
				request("https://api.spotify.com/v1/me", {
                    headers: {
                        Accept: "application/json",
                        Authorization: "Bearer " + access_token,
                        "Content-Type": "application/json"
                    }
                })
                    .on('response', (data) => {
                    res.redirect('/logged_in/' +
                        querystring.stringify({
                            access_token: access_token,
                            refresh_token: refresh_token,
                            id: data.id,
                            username: data.display_name
                        }));
                    debug.print_success_login('User successfully logged in');
					})
			} else {
				res.redirect('/#' +
					querystring.stringify({
						error: 'invalid_token'
					}));
					debug.print_error_login('User unsuccessfully logged in.' + {error: 'Invalid token.'});
			}
		});
	}
});

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