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
const user_schema = new mongoose_1.default.Schema({
    username: String,
    id: String,
    socket: String,
    current_room: String,
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
});
const user_model = mongoose_1.default.model('users', user_schema);
const init_user = (id, username, oAuth) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const new_user = new user_model({
            username: username,
            id: id,
            socket: 0,
            current_room: null,
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
        });
        new_user.save((error, success) => {
            if (error)
                reject(error);
            if (success)
                resolve(success);
        });
    });
});
const get_user_by_id = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        user_model.find({ id: id }, (error, success) => {
            if (error)
                reject(404);
            if (success)
                resolve(success);
        });
    });
});
const update_user = (id, type, value) => __awaiter(void 0, void 0, void 0, function* () {
    let filter;
    let update;
    switch (type) {
        case 'delete':
            return new Promise((resolve, reject) => {
                user_model.deleteOne({ id: id }, (error, success) => {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            });
        case 'login':
            return new Promise((resolve, reject) => {
                filter = { id: id };
                update = { $set: { latest_connection: Date.now(), oAuth: value } };
                user_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, (error, success) => {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            });
        case 'join_room':
            return new Promise((resolve, reject) => {
                filter = { id: id };
                update = { $push: { played_playlists: value }, $set: { latest_connection: Date.now() } };
                user_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, (error, success) => {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            });
        case 'correct_guess':
            return new Promise((resolve, reject) => {
                filter = { id: id };
                update = { $inc: { correct_guesses: value } };
                user_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, (error, success) => {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            });
        case 'incorrect_guess':
            return new Promise((resolve, reject) => {
                filter = { id: id };
                update = { $inc: { incorrect_guesses: value } };
                user_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, (error, success) => {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            });
        case 'rooms_won':
            return new Promise((resolve, reject) => {
                filter = { id: id };
                update = { $inc: { rooms_won: 1 } };
                user_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, (error, success) => {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            });
        case 'rooms_lost':
            return new Promise((resolve, reject) => {
                filter = { id: id };
                update = { $inc: { rooms_lost: 1 } };
                user_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, (error, success) => {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            });
        case 'new_badge':
            return new Promise((resolve, reject) => {
                filter = { id: id };
                update = { $inc: { number_of_badges: 1 }, $push: { badges: value } };
                user_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, (error, success) => {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            });
        case 'socket_change':
            return new Promise((resolve, reject) => {
                filter = { id: id };
                update = { $set: { socket: value } };
                user_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, (error, success) => {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            });
    }
});
exports.default = {
    init_user,
    get_user_by_id,
    update_user
};
