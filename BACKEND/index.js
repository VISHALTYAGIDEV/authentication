import express from "express"
import dotenv from "dotenv"
import connectdb  from "./config/db.js"

dotenv.config()

await connectdb()
const app = express()

const port = process.env.PORT || 4000

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})