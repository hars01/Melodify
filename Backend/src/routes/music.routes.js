const express = require("express");
const musicController = require("../controllers/music.controller");
const multer = require("multer"); // ye multer middleware hai jo file upload ke liye use hota hai. Isko humne require kiya hai taki hum music upload kar sakein.
const authMiddleware = require("../middlewares/auth.middleware")


const router = express.Router();

// yaha pe multer aese kam karta hai ki ye file ko memory me store karta hai aur uske baad hum usko ImageKit ke SDK ka use karke upload karte hain. Isliye humne multer ka storage option memoryStorage set kiya hai taki file ko memory me store kiya ja sake.
const upload = multer({ 
    storage: multer.memoryStorage() 
}); // Use memory storage for multer



router.post("/upload",  authMiddleware.authArtist, upload.single("music") ,musicController.createMusic);

router.post("/album", authMiddleware.authArtist, musicController.createAlbum);

// yah pe jo users hai woh sare music aur album ko dekh/sun sakte hai
router.get("/", authMiddleware.authUser, musicController.getAllMusics)

router.get("/albums", authMiddleware.authUser, musicController.getAllAlbums)


router.get("/albums/:albumId", authMiddleware.authUser, musicController.getAllMusicsOfAlbumByAlbumId)


module.exports = router;