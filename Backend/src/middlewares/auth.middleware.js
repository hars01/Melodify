require('dotenv').config();
const jwt = require("jsonwebtoken");


async function authArtist(req, res, next) {
    
    const token = req.cookies.Token;

    if(!token){
        return res.status(401).json({message: "Token Not Found"});
    }


    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.role !== "artist" && decoded.role !== "admin"){
            return res.status(403).json({ message: "Only artist allowed for doing any changes"  })
        }

        
        
        //eshko hum {music.controller.js} file me use karenge like (req.user.id)
        req.user = decoded; //request ke andar ek new property banegi jiska nam "user" hoga aur hum usme dcoded user ka data store kara denge  


        next() // ye yaha pe eshliye use hota hai ki ek middleware ka work pura hone ke bad dusre work ki request ja sake

    }catch(err){
        console.log(err)

        return res.status(401).json({message: "Something went wrong with validation"})
    }


}


async function authUser(req, res, next) {
    
    const token = req.cookies.Token;

    if(!token){
        return res.status(401).json({message: "Token Not Found"});
    }


    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.role !== "artist" && decoded.role !== "user" && decoded.role !== "admin"){
            return res.status(403).json({ message: "You are not registered/login yet.."  })
        }

        
        
        //eshko hum {music.controller.js} file me use karenge like (req.user.id)
        req.user = decoded; //request ke andar ek new property banegi jiska nam "user" hoga aur hum usme dcoded user ka data store kara denge  


        next() // ye yaha pe eshliye use hota hai ki ek middleware ka work pura hone ke bad dusre work ki request ja sake

    }catch(err){
        console.log(err)

        return res.status(401).json({message: "Something went wrong with validation"})
    }


}



module.exports = {
    authArtist,
    authUser
}