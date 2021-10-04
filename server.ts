const debug = require('./debugging.js')
const database = require('./Database/database.js')

const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const querystring = require('querystring');
const request = require('request');
const ss = require("string-similarity");

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
    password:string,
    latest_login_string:string,
	latest_login_number: number,
    login_token:string,
    played_playlists:string[],
	uuid:number
}

app.post('/add_user', (req:any, res:any) => {
	const new_date = new Date;
	let new_user:New_user = {
		username: req.body.username,
		password: hashPassword(),
		latest_login_number: Date.now(),
		latest_login_string: new_date.toDateString(),
		login_token: getLoginToken(),
		played_playlists: [],
		uuid: uuid4(),
	}
	database.add_new_user(new_user)
	.then(data => res.send({data}))
	
	debug.print_general_status(`Added user ${new_user.username}`);
});