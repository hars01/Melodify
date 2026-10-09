require('dotenv').config();
const { ImageKit } = require("@imagekit/nodejs")


const ImageKitClient = new ImageKit({
    // publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
    // urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
})  

// yaha pe hum file upload karne ke liye ek function banayenge jo ki ImageKit ke SDK ka use karke file ko upload karega aur uska result return karega. Ye function async hoga kyunki file upload ek asynchronous operation hai.
async function uploadFile(file) {
    // yaha pe hum ImageKit ke SDK ka use karke file ko upload karenge. Hum file ka naam "music_" ke saath current timestamp add karke rakhenge taki har file ka unique naam ho. Hum file ko "yt-complete-backend/melodify/music" folder me upload karenge.
    const result = await ImageKitClient.files.upload({
        file,
        fileName: "music_"+Date.now(),
        folder: "yt-complete-backend/melodify/music"
    })

    return result;

}

module.exports = {
    uploadFile
}
