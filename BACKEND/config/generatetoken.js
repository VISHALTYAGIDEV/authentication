import jwt from 'jsonwebtoken'
import { redisClient } from '..'

const generateToken = async(id,res)=>{
    const AccessToken = jwt.sign({id},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"1m"
    })

const RefreshToken = jwt.sign({id},process.env.REFRESH_TOKEN_SECRET,{
    expiresIn:"7d"
})

const RefreshTokenKey =`refresh-token:${id}`
await redisClient.set(RefreshTokenKey,{EX:7*24*60*60},RefreshToken)


// now dono tokens ko cookie mai store karenge 
res.cookie("AccessToken",AccessToken,{
    httpOnly:true,
    secure:true,
    sameSite:"strict",
    maxAge:1*60*1000
})




}
