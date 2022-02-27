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

interface User {
    id:String,
    username:String,
    latest_connection: Date,
    first_connection: Date,
    played_playlists: [String],
    number_of_badges: Number,
    badges: [String],
    correct_guesses: Number,
    incorrect_guesses: Number,
    rooms_won: Number,
    rooms_lost: Number,
    oAuth: String
}

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
        .then((data: string | any[]) => {
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

const get_room = async (id:String) => {
    return new Promise((resolve, reject) => {
        room_model.find({id:id}, (error:any, success:any) => {
            if (error) reject(error);
            if (success) resolve(success);
        })
    })
}
const delete_room = async (id:String) => {
    return new Promise((resolve, reject) => {
        room_model.deleteOne({ id: id }, (error: any, success:any) => {
            if(error) reject(error);
            if(success) resolve(success);
          });
    })
}

const add_player = (id:String, new_player_object:User) => {
    return new Promise((resolve, reject) => {
        let update = { $push: {players: new_player_object}};
        room_model.findOneAndUpdate({ id: id }, update, {useFindAndModify: false, returnOriginal:false}, (error:any, success:any) => {
            if(error) reject(error);
            if(success) resolve([success]);
        }); 
    })
}
const remove_player = async (room_id:String, id:String) => {
    return new Promise(async (resolve, reject) => {
    let room_object:any = await get_room(room_id);
    if(room_object.length === 0) {
        reject(400);
    };
    let filter;
    let update;
    const rest_of_players = room_object[0].players.filter((user: { id: String; }) => user.id != id);
        if(rest_of_players.length === 0){
            delete_room(room_id);
        } else {
            filter = { id: room_id };
            update = { $set: {"players": rest_of_players}};
        }

        room_model.findOneAndUpdate(filter, update, {useFindAndModify: false, returnOriginal:false}, (error:any, success:any) => {
            if(error) reject(error);
            if(success) resolve([success]);
        }); 
    })
}

const update_room = (id:String, type:String, value:String) => {
    switch(type){
        case 'Increment room':
            return new Promise((resolve, reject) => {
                get_room(id)
                .then((room_object:any) => {
                    let filter = { id: id };
                    let update = { 
                        $inc: {currently_playing_number: 1},
                        $set: {
                            currently_playing_offset:room_object[0].songs[room_object[0].currently_playing_number+1].track.track_number-1,
                            currently_playing_track: room_object[0].songs[room_object[0].currently_playing_number+1].track.name,
                            currently_playing_artist:room_object[0].songs[room_object[0].currently_playing_number+1].track.artists[0].name,
                                                uri:room_object[0].songs[room_object[0].currently_playing_number+1].track.album.uri
                        }
                    };
                    room_model.findOneAndUpdate(filter, update, {useFindAndModify: false, returnOriginal:false}, (error:any, success:any) => {
                        if (error) reject(error);
                        if (success) resolve([success]);
                    }); 
                })  
            })
        case 'Pause':
            return new Promise((resolve, reject) => {
                let filter = { id: id };
                let update = { $set:
                    { 
                        paused: true,
                        progress_ms: value
                    }
                };
                room_model.findOneAndUpdate(filter, update, {useFindAndModify: false, returnOriginal:false}, (error:any, success:any) => {
                    if (error) reject(error);
                    if (success) resolve([success]);
                }); 
            })
        case 'Unpause':
            return new Promise((resolve, reject) => {
                let filter = { id: id };
                let update = { $set:
                    {paused: false}
                };
                room_model.findOneAndUpdate(filter, update, {useFindAndModify: false, returnOriginal:false}, (error:any, success:any) => {
                    if (error) reject(error);
                    if (success) resolve([success]);
                }); 
            })
    }
}


module.exports = {
    create_new_room,
    delete_room,
    get_room,
      
    add_player,
    remove_player,

    update_room
}