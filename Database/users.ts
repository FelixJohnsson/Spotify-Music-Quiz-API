import mongoose from 'mongoose'

const user_schema = new mongoose.Schema({
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
    oAuth: String,
})

export interface NewUserData {
    username: string
    id: string
    socket: '0'
    current_room: null
    latest_connection: string
    first_connection: string
    played_playlists: []
    number_of_badges: 0
    badges: []
    correct_guesses: 0
    incorrect_guesses: 0
    rooms_won: 0
    rooms_lost: 0
    oAuth: string
    _id: any
    __v: any
}

const user_model = mongoose.model('users', user_schema)

const init_user = async (id: string, username: string, oAuth: string): Promise<NewUserData> => {
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
            oAuth: oAuth,
        })

        new_user.save((error: any, success: any) => {
            if (error) reject(400)
            if (success) resolve(success)
        })
    })
}

const get_user_by_id = async (id: string): Promise<NewUserData[]> => {
    return new Promise((resolve, reject) => {
        user_model.find({ id: id }, (error: any, success: any) => {
            if (error) reject(404)
            if (success) {
                resolve(success)
            }
        })
    })
}

const update_user = async (id: string, type: string, value?: string | number) => {
    let filter
    let update
    switch (type) {
        case 'delete':
            return new Promise((resolve, reject) => {
                user_model.deleteOne({ id: id }, (error: any, success: any) => {
                    if (error) reject(error)
                    if (success === null) reject(404) // @TODO ERROR DOESNT EXIST, SUCCESS AND ERROR IS NULL IF NOT FOUND
                    if (success) resolve(success)
                })
            })
        case 'login':
            return new Promise((resolve, reject) => {
                filter = { id: id }
                update = { $set: { latest_connection: Date.now(), oAuth: value } }
                user_model.findOneAndUpdate(
                    filter,
                    update,
                    { useFindAndModify: false, returnOriginal: false },
                    (error: any, success: any) => {
                        if (error) reject(error)
                        if (success === null) reject(404) // @TODO ERROR DOESNT EXIST, SUCCESS AND ERROR IS NULL IF NOT FOUND
                        if (success) resolve(success)
                    },
                )
            })
        case 'join_room':
            return new Promise((resolve, reject) => {
                filter = { id: id }
                update = { $push: { played_playlists: value }, $set: { latest_connection: Date.now() } }

                user_model.findOneAndUpdate(
                    filter,
                    update,
                    { useFindAndModify: false, returnOriginal: false },
                    (error: any, success: any) => {
                        if (error) reject(error)
                        if (success === null) reject(404) // @TODO ERROR DOESNT EXIST, SUCCESS AND ERROR IS NULL IF NOT FOUND
                        if (success) resolve(success)
                    },
                )
            })
        case 'correct_guess':
            return new Promise((resolve, reject) => {
                filter = { id: id }
                update = { $inc: { correct_guesses: value } }

                user_model.findOneAndUpdate(
                    filter,
                    update,
                    { useFindAndModify: false, returnOriginal: false },
                    (error: any, success: any) => {
                        if (error) reject(error)
                        if (success === null) reject(404) // @TODO ERROR DOESNT EXIST, SUCCESS AND ERROR IS NULL IF NOT FOUND
                        if (success) resolve(success)
                    },
                )
            })
        case 'incorrect_guess':
            return new Promise((resolve, reject) => {
                filter = { id: id }
                update = { $inc: { incorrect_guesses: value } }

                user_model.findOneAndUpdate(
                    filter,
                    update,
                    { useFindAndModify: false, returnOriginal: false },
                    (error: any, success: any) => {
                        if (error) reject(error)
                        if (success === null) reject(404) // @TODO ERROR DOESNT EXIST, SUCCESS AND ERROR IS NULL IF NOT FOUND
                        if (success) resolve(success)
                    },
                )
            })
        case 'rooms_won':
            return new Promise((resolve, reject) => {
                filter = { id: id }
                update = { $inc: { rooms_won: 1 } }

                user_model.findOneAndUpdate(
                    filter,
                    update,
                    { useFindAndModify: false, returnOriginal: false },
                    (error: any, success: any) => {
                        if (error) reject(error)
                        if (success === null) reject(404) // @TODO ERROR DOESNT EXIST, SUCCESS AND ERROR IS NULL IF NOT FOUND
                        if (success) resolve(success)
                    },
                )
            })
        case 'rooms_lost':
            return new Promise((resolve, reject) => {
                filter = { id: id }
                update = { $inc: { rooms_lost: 1 } }

                user_model.findOneAndUpdate(
                    filter,
                    update,
                    { useFindAndModify: false, returnOriginal: false },
                    (error: any, success: any) => {
                        if (error) reject(error)
                        if (success === null) reject(404) // @TODO ERROR DOESNT EXIST, SUCCESS AND ERROR IS NULL IF NOT FOUND
                        if (success) resolve(success)
                    },
                )
            })
        case 'new_badge':
            return new Promise((resolve, reject) => {
                filter = { id: 'id' }
                update = { $inc: { number_of_badges: 1 }, $push: { badges: value } }

                user_model.findOneAndUpdate(
                    filter,
                    update,
                    { useFindAndModify: false, returnOriginal: true },
                    (error: any, success: any) => {
                        if (error) reject(404)
                        if (success === null) reject(404) // @TODO ERROR DOESNT EXIST, SUCCESS AND ERROR IS NULL IF NOT FOUND

                        if (success) resolve(success)
                    },
                )
            })
        case 'socket_change':
            return new Promise((resolve, reject) => {
                filter = { id: id }
                update = { $set: { socket: value } }

                user_model.findOneAndUpdate(
                    filter,
                    update,
                    { useFindAndModify: false, returnOriginal: false },
                    (error: any, success: any) => {
                        if (error) reject(error)
                        if (success === null) reject(404) // @TODO ERROR DOESNT EXIST, SUCCESS AND ERROR IS NULL IF NOT FOUND
                        if (success) resolve(success)
                    },
                )
            })
    }
}

export default {
    init_user,
    get_user_by_id,
    update_user,
}
