import trycatch from "../middleware/trycatch.js";
import { registerSchema } from "../config/zod.js";
// sanitize basically $ se shuru hone vale jine bhi nosql injections hai unko delete kar dega and mongo tak jane hi nhi dega
import sanitize from  "mongo-sanitize"
import { redisClient } from "../index.js";
import { User } from "../models/User.js";

export const registerUser = trycatch(async(req,res)=>{
    // sanitize is tarike se use hoga 
const sanitizedBody = sanitize(req.body)

// safeParse zod ka function hai jo ki data ko validate karega
const validation = registerSchema.safeParse(sanitizedBody)

// aagar data mai koi bhi gadbad hai usko catch karne ke liye 
if(!validation.success){
    const  zodError = validation.error
let firtErrorMessage = "validation fails!";
let allErrors = []

// ye sbhi hamne specific error message extract karne ke liye kiy hai 
if(zodError?.issues && Array.isArray(zodError.issues)){
    allErrors = zodError.issues.map((issue)=>({
        field:issue.path? issue.path.join(".") : 'unknown',
        message:issue.message || "validation error!",
        code:issue.code
    }))
    firtErrorMessage = allErrors[0]?.message || "validation error!"
}
    return res.status(400).json({
        message : firtErrorMessage,
        error : allErrors, 
    })
}
const {name,email,password} = validation.data;


//rate limiting keliye code
//this line is just storing or making keys for the reddis with the ip address and email 
const rateLimitKey = `register-rate-limit:${req.ip}:${email}`

//now this line will consult the redis whether you have served this user or not 
if(await redisClient.get(rateLimitKey)){
    return res.status(429).json({
        message:"to many requests , try agian later!"
    })
}
const existingUser = await User.findOne({email})
if(existingUser){
   return res.status(400).json({
        message:"user already exists!"
    })
}

res.json({
    name,
    email,
    password
})

})