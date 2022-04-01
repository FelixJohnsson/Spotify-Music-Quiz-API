//@ts-ignore
import mongoose from 'mongoose';

const playlist_schema = new mongoose.Schema({
    img_src:String,
    title:String,
    description:String,
    URI:String,
    number_of_plays: Number,
    number_of_songs: Number
})
const playlist_model = mongoose.model('playlists', playlist_schema);

const get_recommended = async () => {
    return new Promise((resolve, reject) => {
        playlist_model.find({},  (error: any, success:any) => {
            if(error) reject(error);
            if(success) resolve(success);
        })
    })
}
const search_recommended = async (URI:string) => {
    console.log(URI);
    console.log(typeof URI)
    return new Promise((resolve, reject) => {
        playlist_model.find({URI:URI},  (error: any, success:any) => {
            if(error) reject(error);
            if(success) resolve(success);
        })
    })
}

const add_recommended = async (playlist_object:any) => {
    const new_playlist = new playlist_model({
        img_src:playlist_object.images[0].url,
        title:playlist_object.name,
        description:playlist_object.description,
        URI:playlist_object.id,
        number_of_plays: 0,
        number_of_songs: playlist_object.tracks.items.length
    })
    return new Promise((resolve, reject) => {
        new_playlist.save({},  (error: any, success:any) => {
            if(error) reject(error);
            if(success) resolve(success);
        })

    })
}

export default {
    get_recommended,
    search_recommended,
    add_recommended,
}