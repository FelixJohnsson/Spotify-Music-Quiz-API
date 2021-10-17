//@ts-ignore
const mongoose = require('mongoose');

const room_schema = new mongoose.Schema({
    id:String,
    paused: Boolean,
    owner_name: String,
    players:Array,
    playlist_uri: String,
    playlist_description: String,
    playlist_image: String,
    playlist_name: String,
    uri: String,
    link: String,
    songs: Array,
    badge_limit: Number,
    currently_playing_offset: Number,
    currently_playing_track: String,
    currently_playing_artist: String,
    currently_playing_number: Number,
    progress_ms: Number,
    first_connection: Date,
})
const room_model = mongoose.model('rooms', room_schema);

const create_new_room = async (playlist_object:any, display_name:String) => {
    return new Promise((resolve, reject) => {
        const new_room = new room_model({
            id:1,
            paused: false,
            owner_name: display_name,
            players:[],
            playlist_uri: playlist_object.URI,
            playlist_description: playlist_object.description,
            playlist_image: playlist_object.images[0].url,
            playlist_name: playlist_object.name,
            uri: playlist_object.uri,
            link: playlist_object.external_urls.spotify,
            songs: playlist_object.tracks.items,
            badge_limit: 85,
            currently_playing_offset: null,
            currently_playing_track: null,
            currently_playing_artist: null,
            currently_playing_number: 0,
            progress_ms: 0,
            first_connection: Date.now(),
        })
        for (let i = new_room.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [new_room.songs[i], new_room.songs[j]] = [new_room.songs[j], new_room.songs[i]];
        }
        room_model.find().sort({_id:-1}).limit(1)
        .then(data => {
            if(data.length > 0){
                new_room.id = parseInt(data[0].id) + 1;
            }
            new_room.save((error:any, success:any) => {
                if (error) reject(error);
                if (success) resolve(success);
            });
        })
    })
}



module.exports = {
    create_new_room,
    /*
    delete_room,
    get_room,
    add_player,
    remove_player,
    update_room
    */
}