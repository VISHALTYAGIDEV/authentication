import express from "express"
import dotenv from "dotenv"
import connectdb  from "./config/db.js"
import { createClient } from "redis"
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
redisClient
.connect()
.then(()=>console.log("redis connected successsfully!"))
.catch(console.error)



const app = express()

// middlewares
app.use(express.json())

// importing user routes eek hi baar import hote hai 
import userRoutes from "./routes/user.js"

// using routes matlab jab bhi /api/v1 se request aayegi to ye usko sidhe userroutes mai bhej do
app.use("/api/v1", userRoutes)



const port = process.env.PORT || 4000

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})