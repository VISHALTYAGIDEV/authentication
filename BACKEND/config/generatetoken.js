import jwt from 'jsonwebtoken'
import { redisClient } from '../index.js'

export const generateToken = async(id,res)=>{
    const AccessToken = jwt.sign({id},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"15m"
    })

const RefreshToken = jwt.sign({id},process.env.REFRESH_TOKEN_SECRET,{
    expiresIn:"7d"
})

const RefreshTokenKey =`refresh-token:${id}`
await redisClient.set(RefreshTokenKey,RefreshToken,{EX:7*24*60*60})


// now dono tokens ko cookie mai store karenge 
res.cookie("AccessToken",AccessToken,{
    httpOnly:true,  // // ← XSS: script cookie padh nahi sakti
 secure:false,   // ← sirf HTTPS pe jaayegi
    sameSite:"lax",  // ← CSRF: doosri site se cookie nahi jaati
    maxAge:15*60*1000
})

res.cookie("RefreshToken",RefreshToken,{
    maxAge:7*24*60*60*1000,
    httpOnly:true,
    // sameSite:"none",
    secure:false,
    sameSite:"lax"
})
return {AccessToken,RefreshToken}
}





// now jab accesstoken expire ho jayega tab ham log refresh token ki madad se usko dubara generate karenge and uske liye hamko refreshtoken ko verify karna padega phele 
export const verifyRefreshToken = async(RefreshToken)=>{
  try {
      const decode = jwt.verify(RefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const storedToken = await redisClient.get(`refresh-token:${decode.id}`)

    if(storedToken===RefreshToken){
        return decode
    }
    return null
  } catch (error) {
    return null
  }
}



//now jab refresh token verify kar liya then ham log aab accestoken generate karenge 
export const generateAccessToken = (id,res)=>{
    const AccessToken = jwt.sign({id},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"1m"
    })
    res.cookie("AccessToken",AccessToken,{
    httpOnly:true,  // // ← XSS: script cookie padh nahi sakti
    secure:false,   // ← sirf HTTPS pe jaayegi   true
    sameSite:"lax",  // ← CSRF: doosri site se cookie nahi jaati  strict
    maxAge:1*60*1000
})
//ab token refersh karne ke liye eek api banegi jo ki controller mai likhi hai so check there
}



//logout karne ke baad redis se bhi to user data delete karna padega
export const revokeRefreshToken = async(userId)=>{
    await redisClient.del(`refresh-token:${userId}`)
}