import express from "express"
import dotenv from "dotenv"
import connectdb  from "./config/db.js"
import { createClient } from "redis"
import cookieParser from "cookie-parser"
import cors from "cors"
dotenv.config()

await connectdb()


// here we are connection our server with redis for rate limiting ,here hamne sirf eek connection stablish kiya hai server and redis ke beech mai and have make it usefull to thecontroller if need anywhere
const redisUrl = process.env.REDIS_URL
if(!redisUrl){
    console.log("redis url missing")
    process.exit(1)
}
export const redisClient = createClient({
    url:redisUrl
})

redisClient.on("error", (err) => console.error("redis error:", err))
redisClient
.connect()
.then(()=>console.log("redis connected successsfully!=================="))
.catch(console.error)




const app = express()

// middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
    methods:["GET","PUT","POST","DELETE","OPTIONS"]
}))

// importing user routes eek hi baar import hote hai 
import userRoutes from "./routes/user.js"

// using routes matlab jab bhi /api/v1 se request aayegi to ye usko sidhe userroutes mai bhej do
app.use("/api/v1", userRoutes)



const port = process.env.PORT || 5000

app.listen(port,()=>{
    console.log(`server is running on port ${port}🍌`)
})