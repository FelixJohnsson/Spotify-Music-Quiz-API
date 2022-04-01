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
const mongoose_1 = __importDefault(require("mongoose"));
const playlist_schema = new mongoose_1.default.Schema({
    img_src: String,
    title: String,
    description: String,
    URI: String,
    number_of_plays: Number,
    number_of_songs: Number
});
const playlist_model = mongoose_1.default.model('playlists', playlist_schema);
const get_recommended = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        playlist_model.find({}, (error, success) => {
            if (error)
                reject(error);
            if (success)
                resolve(success);
        });
    });
});
const search_recommended = (URI) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(URI);
    console.log(typeof URI);
    return new Promise((resolve, reject) => {
        playlist_model.find({ URI: URI }, (error, success) => {
            if (error)
                reject(error);
            if (success)
                resolve(success);
        });
    });
});
const add_recommended = (playlist_object) => __awaiter(void 0, void 0, void 0, function* () {
    const new_playlist = new playlist_model({
        img_src: playlist_object.images[0].url,
        title: playlist_object.name,
        description: playlist_object.description,
        URI: playlist_object.id,
        number_of_plays: 0,
        number_of_songs: playlist_object.tracks.items.length
    });
    return new Promise((resolve, reject) => {
        new_playlist.save({}, (error, success) => {
            if (error)
                reject(error);
            if (success)
                resolve(success);
        });
    });
});
exports.default = {
    get_recommended,
    search_recommended,
    add_recommended,
};
