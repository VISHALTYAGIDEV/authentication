import trycatch from "../middleware/trycatch.js";
import { registerSchema } from "../config/zod.js";
// sanitize basically $ se shuru hone vale jine bhi nosql injections hai unko delete kar dega and mongo tak jane hi nhi dega
import sanitize from  "mongo-sanitize"

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

res.json({
    name,
    email,
    password
})

})