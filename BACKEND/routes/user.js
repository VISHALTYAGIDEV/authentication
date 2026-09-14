import express from "express"
import { registerUser, userlogin, verifyUser,verifyOtp, myprofile, RefreshToken } from "../controller/user.js"
import isAuth from "../middleware/isAuth.js"

const router = express.Router()

// registeruser ka route matlab jo bhi request abhi hmari routes se aai hai usko receive karo and check karo ki method and apiname match kar raha hai and then send it to respective controller
router.post("/register",registerUser)

// verification during register user route 
router.post("/verify/:token",verifyUser)

//login route 
router.post("/login",userlogin)

//verify during login route 
router.post("/verify",verifyOtp)

//phele route with middleware
router.get("/my",isAuth,myprofile)

//access token ko refresh karne ka route 
router.post("/refresh",RefreshToken)


export default router