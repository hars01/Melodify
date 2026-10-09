# Starting By That Terminal Codes :
 -> npm init -y
 -> npm i express dotenv cookie-parser jsonwebtoken mongoose









# $or 


-> used in {{controller}} folder at {auth.controller.js} file on time of finding user are exist or not in database.

 -> $or jo hai woh ek array ke andar object ke form me data leta hai jo mongoDB server me as a OR operator kam karta hai 

 example: 
 $or [
    {},
    {},
    {},
    {}
 ]

 -> ye esh liye kam aata hai ki database me koi bhi operation karna ho diye/mentioned object ke sath toh ye compulsury nahi hai ki sabhi available ho agar koi ek hi available hu toh ushe return kardega

 -> Senario:
     let be have 2 users 
     user 1, user 2
     aur hume ayesa data mila query karne ke liye
     ![use case senario](image.png)


     Without $or :
     toh ab yaha senario ye banta hai ki OR operatorn hai nahi aur hume data mila hai "username: a", "email:b@b.com" toh yaha query chalne par NULL value aajayegi par ye galat hai

     With $or :
     toh ab yaha senario ye banta hai ki OR operatorn hai aur hume data mila hai "username: a", "email:b@b.com" toh yaha query chalne OR operator username se data alag find karega aur email se alag aur phir result/output me dono user(a, b) ki details dedga ya koi error message delana ho toh dedenge like (user already exist with email or username, user unique email or username) aysa kuchh






# Hashing

-> Importance of Hashing
![hashing importance](image-1.png)

-> How it will worked
![working senario](image-2.png)

-> same input hoga agar toh same hi hashing key/string milta hai chahe jitna bar hash generate kar le

-> hum plain text "test" ko hash string/key me convert karsakte hai par same hash key/string ko simple plain text as usual/original form me bilkul nahi convert kar sakte

-> yah pe hum hash ka use eshliye karte hai kyuki hum plaintext me password rakhte hai DB me toh ushko attacker/hacker se safe rakhne ke liye ush plain text password ko hash me convert karte hai jisase hume hash address/string/key find hota hai aur phir ushko DB me rakhte hai 

-> installation package : npm i bycryptjs
ye help karega hume plaintxt ko hash me convert karne me 

-> use of becrypt: at {{controllers}} folder in {auth.controller.js} file

in that way: 
    const hash = await bcrypt.hash(password, 10)


    10 yaha pe salt hota hai hum apne use case ke hisab se alag alag value de sakte hai


    jab koi attacker attack kar raha hota hai toh ye salt ushke attack ko delay karane ke liye use hota hai, hum eshke help se kitane bhi time tak attack ko delay kara sakte hai like 1000 sal tak bhi 


    ![salting](image-3.png)


-> how to check coming password from user end is correct 
     
    + use bcrypt.compare() method 

    + For Example:
     const isPasswordValid = await bcrypt.compare(password, user.password)

    + yaha pe ye method jo user ka password hai ushko becrypt/hash me convert karega aur phir ushko DB me store password se match karke final conclusion dega ki user se password aaraha hai woh sahi hai ya nahi 




# Multer

-> use in {{routes/music.routes.js}} file
-> npm i multer
-> ye help karta hai file upload karane me 
-> multer aese kam karta hai ki ye file ko memory me store karta hai aur uske baad hum usko ImageKit ke SDK ka use karke upload karte hain. Isliye humne multer ka storage option memoryStorage set kiya hai taki file ko memory me store kiya ja sake.







# Middlwares 
-> ye {{ src/middlewares }} folder hai jaha pe hum jo bhi kam/logic bar bar use ho raha hai controllers/business logic ko likhne me ushko hum ya rakhte hai ek jagah aur bar bar use kar letre hai
-> jaise {middlwares/auth.middleware.js} eshke andar hum token verification ka code/logic ek hi jagah esh file me rakhenge aur phir eshko export karke jaha token validate kana ho waha use kar sakte hai...
-> jab hum middleware create karte hai toh waha 3 parameter hote hai like (req, res, next)
-> eshko esh {middlwares/auth.middleware.js} file se export karke hum esh {routes/music.routes.js} file me routing ke waqt use karte hai..
-> next() ka use : ye hum use eshliye karte hai ki request ek middleware se aage kam ke liye (forward ho)/ja sake
-> agar next() ka use nahi karnege toh request middleware me toh jayegi par aage forward nahi payegi..
-> middleware request ke andar jo bhi data aata hai sab ko read kar sakte hai, response bhi send kar sakte hai aur modify bhi kar sakte hai
