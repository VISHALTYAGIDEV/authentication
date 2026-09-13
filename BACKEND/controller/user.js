import trycatch from "../middleware/trycatch.js";
import { registerSchema,loginSchema } from "../config/zod.js";
// sanitize basically $ se shuru hone vale jine bhi nosql injections hai unko delete kar dega and mongo tak jane hi nhi dega
import sanitize from  "mongo-sanitize"
import { redisClient } from "../index.js";
import { User} from "../models/User.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import sendMail from "../config/sendMail.js";
import { getVerifyEmailHtml,getOtpHtml } from "../config/html.js";




/*---------------------------------------------------------------------------------------------------------------------------------
User ko register karane ke liye complete controller */
// ----------------------------------------------------------------------------------------------------------------

//no sql injection se prevent karne keliye 
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
//--------------------------------------------------------------------------------------------------------------------------



//rate limiting implementation---------------------------------------------------------------------------------------------------------------------
//this line is just storing or making keys for the reddis with the ip address and email , ham log redis and mongo dono ko check karenge redis short time ke liye and db long period of time ke liye 
const rateLimitKey = `register-rate-limit:${req.ip}:${email}`

//now this line will consult the redis whether you have served this user or not 
if(await redisClient.get(rateLimitKey)){
    //    console.log("MY rate limit hit")  
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
//------------------------------------------------------------------------------------------------------




//-----------------------------------------------------------------------------------------------------------------
/*REGISTER:
  hash password
  random token banao
  {name, email, hashedPassword} → Redis mein 5 min ke liye
  token se link banao → email bhejo
  reply: "check your email"
  ❌ MongoDB mein kuch nahi gaya

VERIFY (user link pe click karta hai):
  URL se token nikalo
  Redis se data lo
    → null mila? = expire ya galat link → error
  JSON.parse karo
  ab MongoDB mein user save karo ✅
  Redis se key delete karo (taaki link dobara na chale)*/
//yaha par user ko redis mai store kara rahe hai until email verifies
const hashedPassword = await bcrypt.hash(password,10)
// Ye wahi token hai jo email ke link mein jaayega: for ex http://localhost:3000/verify/a3f9b2...
const verifyToken = crypto.randomBytes(32).toString("hex")
const verifyKey = `verify:${verifyToken}`
//Redis sirf text rakh sakta hai, object nahi. To object ko text mein badalna padta hai.
const datatoStore = JSON.stringify({
    name,
    email,
    password:hashedPassword
})
await redisClient.set(verifyKey,datatoStore,{EX:300})

const subject = "verify email to register the user!"
// html ke andar bheji jaati hai token and email and then sendEmail function automatically email send kae deta hai
const html = getVerifyEmailHtml({email,token:verifyToken})
// now just send the mail , mail send karna controller ka kam nahi hai yaha sirf hum mail ko send karne ka order de rahe hai
await sendMail({email,subject,html})
//jabtak rate limiting hai tab tak nahi bhej paayega dubara email
await redisClient.set(rateLimitKey,"true",{EX:60})
//----------------------------------------------------------------------------------------------------

res.json({
    message:"if your email is valid then , verification link via email has been send"
})

})



// -------------------------------------------------------------------------------------------------------------
//now email vagera send ho gau hai to user ko verify karna hai bass
export const verifyUser = trycatch(async(req,res)=>{
    const {token} = req.params
    // console.log(token)

    // token nahi mila to ye 
    if(!token){
        return res.status(400).json({
            message:"authentication token is required!"
        })
    }

    //token  mila to ye 
    const verifyKey = `verify:${token}`

    //key ki madad se user data nikalna hai jo ki redis mai hai
    const userdataJSON = await redisClient.get(verifyKey)

    //data nahi mila to
    if(!userdataJSON){
        return res.status(400).json({
            message:"verification link is expired!"
        })
    }

const userData = JSON.parse(userdataJSON)

const existingUser = await User.findOne({email:userData.email})
if(existingUser){
   return res.status(400).json({
        message:"user already exists!"
    })
}
const newUser = await User.create({
    name:userData.name,
    email:userData.email,
    password:userData.password,
})
await redisClient.del(verifyKey)


res.status(201).json({
    message:"email verified successfully! and your account has been created!",
    user:{_id:newUser._id, name:newUser.name, email:newUser.email},
})
})
//-----------------------------------------------------------------------------------------------------------------------------------------





//----------------------------------------------------------------------------------------------------------------------------
//  now user login ka controller 
//------------------------------------------------------------------------------------------------------------------
/* isme bhi same hi flow chalega register user ki tarah like phele data ko sanitize and usable banao zod and mongosanitize ka use karke 
     then  rate limit lagao and then user ko find karke baaki ka kaam karo */ 
export const userlogin = trycatch(async(req,res)=>{
    const sanitizedBody = sanitize(req.body)
// safeParse zod ka function hai jo ki data ko validate karega
const validation = loginSchema.safeParse(sanitizedBody)
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
const {email,password} = validation.data;




const rateLimitKey = `login-rate-limit:${req.ip}:${email}`
if(await redisClient.get(rateLimitKey)){
    //    console.log("MY rate limit hit")  
    return res.status(429).json({
        message:"to many requests , try agian later!"
    })
}


const  user = await User.findOne({email})
if (!user){
    res.status(400).json({
        message:"Invalid credentials!"
    })
}

// console.log("password",user.password)
const comparePassword = await bcrypt.compare(password,user.password)
if(!comparePassword){
    res.status(400).json({
        message:"Invalid credentials!"
    })
}

const otp = Math.floor(100000 + Math.random()*900000).toString()
const otpKey = `login-otp:${email}`
// is rate limit ka matlab purana otp 5min tak valid rahega
await redisClient.set(otpKey,JSON.stringify(otp),{
    EX:300
})

const subject = "otp verification for login!"
const html = getOtpHtml({email,otp})

await sendMail({email,subject,html})

// is rate limit ka matlab ki user 1 min ke baad hi new otp mang sakta hai
await redisClient.set(rateLimitKey,"true",{
    EX:60
})
res.json({
    message:"if your email is valid then otp has been send via mail , and valid for 5 minutes!"
})



})