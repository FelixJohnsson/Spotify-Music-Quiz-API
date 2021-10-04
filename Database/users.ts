//@ts-ignore
const mongoose = require('mongoose');

const user_schema = new mongoose.Schema({
    username:String,
    id:String,
    password:String,
    latest_login:String,
    login_token:String,
    played_playlists:Array,
})

const user_model = mongoose.model('users', user_schema);

const add_new_user = (user_object) => {
    const new_user = new user_model({
        username:user_object.username,
        id:user_object.id,
        password:user_object.password,
        latest_login:user_object.latest_login,
        login_token:user_object.login_token,
        played_playlists:user_object.played_playlists,
    })
    return new Promise(resolve => {
        new_user.save({},  (error: any, success:any) => {
            if(error) resolve(error);
            if(success) resolve(success);
        })
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
    add_new_user, 
    get_user_by_id
}