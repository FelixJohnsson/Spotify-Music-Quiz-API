//@ts-ignore
const mongoose = require('mongoose');

const user_schema = new mongoose.Schema({
    username: String,
    id: String,
    socket: String,
    latest_connection: String,
    first_connection: String,
    played_playlists: Array,
    number_of_badges: Number,
    badges: Array,
    correct_guesses: Number,
    incorrect_guesses: Number,
    rooms_won: Number,
    rooms_lost: Number,
    oAuth: String
})

const user_model = mongoose.model('users', user_schema);

const init_user = async (id: String, username:String, oAuth:String) => {
    return new Promise((resolve, reject) => {
        const new_user = new user_model({
            username: username,
            id: id,
            socket: 0,
            latest_connection: Date.now(),
            first_connection: Date.now(),
            played_playlists: [],
            number_of_badges: 0,
            badges: [],
            correct_guesses: 0,
            incorrect_guesses: 0,
            rooms_won: 0,
            rooms_lost: 0,
            oAuth: oAuth
        })
    
        new_user.save(function (error:any, success:any) {
            if(error) reject(error);
            if(success) resolve(success);
        });
    })

}
const get_user_by_id = async (id: string) => {
    return new Promise((resolve, reject) => {
        user_model.find({username:id}, (error:any, success:any) => {
            if(error) reject(404);
            if(success) resolve(success);
        })
    })
}



module.exports = {
    init_user, 
    get_user_by_id
}