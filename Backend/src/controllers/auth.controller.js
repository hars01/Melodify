require('dotenv').config();
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")

async function registerUser(req, res) {
    const { username, password, email, role="user" } = req.body;

    if(!username || !password || !email) {
        return res.status(400).json({ message: "Username, password, and email are required." });
    }


    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            {username: username},
            {email: email}
        ]
    });
  
    if(isUserAlreadyExists) {
        return res.status(409).json({ message: "User with this username or email already exists." });
    }


    const hash = await bcrypt.hash(password, 10)


   const user = await userModel.create({
    username,
    email,
    password: hash, // database me password ke jagah hum password se generated hash string ko store karayenge
    role
   })

   const token = jwt.sign({
    id: user._id,
    role: user.role,
   }, process.env.JWT_SECRET)

   res.cookie(`Token`, token)
    
   res.status(201).json({
    message: "User registered successfully",
    user:{   
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        password: user.password
    },

   })

}


async function loginUser(req, res) {

    const { username, password, email } = req.body;
    

    if(!username && !email) {
        return res.status(400).json({ message: "Username or email is required." });
    }

    const user = await userModel.findOne({
        $or: [
            {username},
            {email}
        ]
    });


    if(!user) {
        return res.status(401).json({ message: "User not found/Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign({
        id: user._id,
        role: user.role,
    }, process.env.JWT_SECRET);

    res.cookie("Token", token)

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            // password: user.password
        },
    });

}



async function logoutUser(req, res){
    res.clearCookie("Token")
    res.status(200).json({message: "You are successfully logged out"})
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser
}