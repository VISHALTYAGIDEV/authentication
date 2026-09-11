import trycatch from "../middleware/trycatch.js";

export const registerUser = trycatch(async(req,res)=>{
const {name,email,password} = req.body

res.json({
    name,
    email,
    password
})

})