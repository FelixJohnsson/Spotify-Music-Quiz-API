var debug = require('./debugging.js');
var database = require('./Database/database.js');
var cors = require('cors');
var cookieParser = require('cookie-parser');
require('dotenv').config();
var querystring = require('querystring');
var request = require('request');
var ss = require("string-similarity");
//DATABASE - MongoDB & Mongoose
//@ts-ignore
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(function (res) { return debug.print_success_status('Connected to MongoDB.'); })["catch"](function (err) { return debug.print_error_status('Failed to connect to MongoDB.'); });
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
app.post('/add_user', function (req, res) {
    var new_date = new Date;
    var new_user = {
        username: req.body.username,
        password: hashPassword(),
        latest_login_number: Date.now(),
        latest_login_string: new_date.toDateString(),
        login_token: getLoginToken(),
        played_playlists: [],
        uuid: uuid4()
    };
    database.add_new_user(new_user)
        .then(function (data) { return res.send({ data: data }); });
    debug.print_general_status("Added user " + new_user.username);
});
