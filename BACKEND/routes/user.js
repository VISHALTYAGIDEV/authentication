import express from "express"
import { registerUser, verifyUser } from "../controller/user.js"

const router = express.Router()

// registeruser ka route matlab jo bhi request abhi hmari routes se aai hai usko receive karo and check karo ki method and apiname match kar raha hai and then send it to respective controller
router.post("/register",registerUser)

router.post("/verify/:token",verifyUser)

export default router