import jwt from "jsonwebtoken"
import { redisClient } from "../index.js"
import { User } from "../models/User.js"
// import { Error } from "mongoose"
// import { json } from "zod"





//Kaam hai req.user bharna, taaki controller ko pata ho ki request kis user ki hai.
const isAuth = async(req,res,next)=>{
    try {
        const token = req.cookies.AccessToken
        if(!token){
            return res.status(403).json({
                message:"no token"
            })
        }
const decodedData = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)/*Signature check — token ke saath chhedchhad to nahi hui
Expiry check — 1 minute wala time khatam to nahi hua*/
// console.log("DECODED:", decodedData)
if(!decodedData){
    return resizeBy.status(400).json({
        message:"token expired!"
    })
}

//ab user ka data mil chuka hai object format mai then ab humm log reddis mai user ko store kara lenge
const cacheUser = await redisClient.get(`user:${decodedData.id}`)
if(cacheUser){
req.user = JSON.parse(cacheUser)
return next()
}

const user = await User.findById(decodedData.id).select("-password")
if(!user){
    return res.status(400).json({
        message:"no user found with these credentials"
    })
}

await redisClient.setEx(`user:${user._id}`,3600,JSON.stringify(user))
req.user = user;
return next()

    } 
    catch (error) {
        res.status(500).json({
            message:error.message      
          })
    }
}

export default isAuth;