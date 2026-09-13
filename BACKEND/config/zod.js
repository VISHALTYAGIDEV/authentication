import {z} from "zod"

// ye sirf eek function hai jo ki controller mai eek barr run karega to check the res.data
export const registerSchema = z.object({
    name:z.string().min(2,"nam atleast should be 2 characters!"),
    email:z.string().email("invalid email format!"),
    password:z.string().min(8,"atleast 8 characters long!")
})



//login user ka schema 
export const loginSchema = z.object({
    email:z.string().email("invalid email format!"),
    password:z.string().min(8,"atleast 8 characters long!")
})