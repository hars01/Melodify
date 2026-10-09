const mongoose = require('mongoose');

// ye tarika hai music ke liye schema banane ka. Isme humne uri, title aur artist ke fields define kiye hain. Artist field me humne user model ka reference diya hai taki pata chale ki ye music kis artist ne upload kiya hai.
const musicSchema = new mongoose.Schema({

    uri: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    }
})


const musicModel = mongoose.model("music", musicSchema); // yaha humne "music" ko lowercase me rakha hai taki database me collection ka naam "musics" ho jaye. Agar humne "Music" rakha hota to collection ka naam "Musics" hota.

module.exports = musicModel;