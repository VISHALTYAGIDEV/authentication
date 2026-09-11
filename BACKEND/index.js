import express from "express"
import dotenv from "dotenv"
import connectdb  from "./config/db.js"

dotenv.config()

await connectdb()
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