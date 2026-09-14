import jwt from 'jsonwebtoken'
import { redisClient } from '../index.js'

export const generateToken = async(id,res)=>{
    const AccessToken = jwt.sign({id},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"1m"
    })

const RefreshToken = jwt.sign({id},process.env.REFRESH_TOKEN_SECRET,{
    expiresIn:"7d"
})

const RefreshTokenKey =`refresh-token:${id}`
await redisClient.set(RefreshTokenKey,RefreshToken,{EX:7*24*60*60})


// now dono tokens ko cookie mai store karenge 
res.cookie("AccessToken",AccessToken,{
    httpOnly:true,  // // ← XSS: script cookie padh nahi sakti
    // secure:true,   // ← sirf HTTPS pe jaayegi
    sameSite:"strict",  // ← CSRF: doosri site se cookie nahi jaati
    maxAge:1*60*1000
})

res.cookie("RefreshToken",RefreshToken,{
    maxAge:7*24*60*60*1000,
    httpOnly:true,
    sameSite:"none",
    // secure:true
})



return {AccessToken,RefreshToken}

}
