var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
//@ts-ignore
var mongoose = require('mongoose');
var room_schema = new mongoose.Schema({
    id: String,
    paused: Boolean,
    owner_name: String,
    players: Array,
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
    first_connection: Date
});
var room_model = mongoose.model('rooms', room_schema);
var create_new_room = function (playlist_object, display_name) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                var _a;
                var new_room = new room_model({
                    id: 1,
                    paused: false,
                    owner_name: display_name,
                    players: [],
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
                    first_connection: Date.now()
                });
                for (var i = new_room.songs.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    _a = [new_room.songs[j], new_room.songs[i]], new_room.songs[i] = _a[0], new_room.songs[j] = _a[1];
                }
                room_model.find().sort({ _id: -1 }).limit(1)
                    .then(function (data) {
                    if (data.length > 0) {
                        new_room.id = parseInt(data[0].id) + 1;
                    }
                    new_room.save(function (error, success) {
                        if (error)
                            reject(error);
                        if (success)
                            resolve(success);
                    });
                });
            })];
    });
}); };
var get_room = function (id) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                room_model.find({ id: id }, function (error, success) {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            })];
    });
}); };
var delete_room = function (id) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                room_model.deleteOne({ id: id }, function (error, success) {
                    if (error)
                        reject(error);
                    if (success)
                        resolve(success);
                });
            })];
    });
}); };
var add_player = function (id, new_player_object) {
    return new Promise(function (resolve, reject) {
        var update = { $push: { players: new_player_object } };
        room_model.findOneAndUpdate({ id: id }, update, { useFindAndModify: false, returnOriginal: false }, function (error, success) {
            if (error)
                reject(error);
            if (success)
                resolve([success]);
        });
    });
};
var remove_player = function (room_id, id) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var room_object, filter, update, rest_of_players;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, get_room(room_id)];
                        case 1:
                            room_object = _a.sent();
                            if (room_object.length === 0) {
                                reject(400);
                            }
                            ;
                            rest_of_players = room_object[0].players.filter(function (user) { return user.id != id; });
                            if (rest_of_players.length === 0) {
                                delete_room(room_id);
                            }
                            else {
                                filter = { id: room_id };
                                update = { $set: { "players": rest_of_players } };
                            }
                            room_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, function (error, success) {
                                if (error)
                                    reject(error);
                                if (success)
                                    resolve([success]);
                            });
                            return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
var update_room = function (id, type, value) {
    switch (type) {
        case 'Increment room':
            return new Promise(function (resolve, reject) {
                get_room(id)
                    .then(function (room_object) {
                    var filter = { id: id };
                    var update = {
                        $inc: { currently_playing_number: 1 },
                        $set: {
                            currently_playing_offset: room_object[0].songs[room_object[0].currently_playing_number + 1].track.track_number - 1,
                            currently_playing_track: room_object[0].songs[room_object[0].currently_playing_number + 1].track.name,
                            currently_playing_artist: room_object[0].songs[room_object[0].currently_playing_number + 1].track.artists[0].name,
                            uri: room_object[0].songs[room_object[0].currently_playing_number + 1].track.album.uri
                        }
                    };
                    room_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, function (error, success) {
                        if (error)
                            reject(error);
                        if (success)
                            resolve([success]);
                    });
                });
            });
        case 'Pause':
            return new Promise(function (resolve, reject) {
                var filter = { id: id };
                var update = { $set: {
                        paused: true,
                        progress_ms: value
                    }
                };
                room_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, function (error, success) {
                    if (error)
                        reject(error);
                    if (success)
                        resolve([success]);
                });
            });
        case 'Unpause':
            return new Promise(function (resolve, reject) {
                var filter = { id: id };
                var update = { $set: { paused: false }
                };
                room_model.findOneAndUpdate(filter, update, { useFindAndModify: false, returnOriginal: false }, function (error, success) {
                    if (error)
                        reject(error);
                    if (success)
                        resolve([success]);
                });
            });
    }
};
module.exports = {
    create_new_room: create_new_room,
    delete_room: delete_room,
    get_room: get_room,
    add_player: add_player,
    remove_player: remove_player,
    update_room: update_room
};
