const musicModel = require("../models/music.model");
const { uploadFile } = require("../services/storage.service");
const albumModel = require("../models/album.model");


const jwt = require("jsonwebtoken");

async function createMusic(req, res) {
    // Get the token from the request cookies which was stored in cookie storage when the user registered and logged in. This token is used to verify the user's identity and access rights.
    const token = req.cookies.Token;

    // check if the token is present in the request cookies
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    //verify the token and extract the user ID
    try {
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // if(decoded.role !== "artist") {
        //     return res.status(403).json({ message: "Forbidden: Only artists can upload music." });
        // }
        
    


    const { uri, title } = req.body;
    const file = req.file; // Assuming you're using multer to handle file uploads

    if (!uri || !title) {
        return res.status(400).json({ message: "URI and title are required." });
    }


    const result = await uploadFile(file.buffer.toString('base64')); // Convert the file buffer to base64 string before uploading

    const music = await musicModel.create({
        uri: result.url, // Use the URL returned from ImageKit
        title,
        artist: req.user.id, // Use the user ID from the decoded token, joki {auth.middleware.js} file se aaraha hai
    });


    res.status(201).json({
        message: "Music uploaded successfully",
        music: {
            id: music._id,
            uri: music.uri,
            title: music.title,
            artist: music.artist,
        },
    }); 


    } catch (error) {
        console.error("Error Coming : ", error);
        return res.status(401).json({ message: "Some thing wen wrong with create music logics" });
    }

}


async function createAlbum(req, res) {
 
    const token = req.cookies.Token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {

        const { title, musics} = req.body;

        if (!title || !musics) {
            return res.status(400).json({ message: "Title and musics are required." });
        }

        const album = await albumModel.create({
            title,
            musics: musics, // Assuming musics is an array of music IDs
            artist: req.user.id, // Use the user ID from the decoded token, joki ye esh {auth.middleware.js} file se aaraha hai
        })

        res.status(201).json({
            message: "Album created successfully",
            album: {
                id: album._id,
                title: album.title,
                musics: album.musics,
                artist: album.artist,
            },
        });

    } catch(err){
        console.log(err);

        return res.status(401).json({ message: "Somthing wen wrong in album creating logics" });
    }

}



async function getAllMusics(req, res){

    // yaha populate nahi hai toh kewal artist ki id bas ayegi na ki details
    //   const musics = await musicModel.find()



    // populate lagane se artist ki id ke sath puri details bhi aajati hai
    //   const musics = await musicModel.find().pupulate("artist")



    // yaha pe hum limits ka use eshliye kar rahe hai kyuki jab hum server se all musics ka request kare aur data millions/bahutJada ho toh hum sare data ko na load kara ke kuchh limited hi data load karate hai eshashe server me storage ki problem nahi hoti kyuki jab millions musics ke data ko load karte toh storage bahrne ya server crash/slow hone ka chance hota hai
    // skip ka matalab kitane data ko skip karne ke bad hu data ko load kare server me par dhyan rahe limit ko cross nahi kar sakte like 20 yaha limit hai toh 20 ya 20 se kam music data load honge agar jada hu toh load nahi hoga 
    const musics = await musicModel.find().skip(0).limit(20).populate("artist")
      

      res.status(200).json({
        message: "Musics fetched successfully",
        musics: musics,
      })



}






async function getAllAlbums(req, res){

    // yaha populate nahi hai toh kewal artist ki id bas ayegi na ki details
    //   const albuma = await albumModel.find()

    // populate lagane se artist ki id ke sath puri details bhi aajati hai
    //   const albums = await albumModel.find().pupulate("artist")


    // yaha pe .select() method eshliye lagaye hai kyuki hum jab home screen me honge toh sara musics ek sath load na ho, eshliye hum kewal album ka "title" aur "artist" ko dikhayenge...
      const albums = await albumModel.find().select("title artist").populate("artist")

      

      res.status(200).json({
        message: "Albums fetched successfully",
        musics: albums,
      })



}

async function getAllMusicsOfAlbumByAlbumId(req, res){


    const albumId = req.params.albumId;


    const album = await albumModel.findById(albumId).populate("artist")

      

      res.status(200).json({
        message: "Album's all musics fetched successfully",
        musics: album,
      })



}


module.exports = {
    createMusic,
    createAlbum,
    getAllMusics,
    getAllAlbums,
    getAllMusicsOfAlbumByAlbumId
}
