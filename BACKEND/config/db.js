import  mongoose from "mongoose"

const connectdb = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL,{
            dbName: "MERNAuthentcation"
        })
    } catch (error) {
        console.log("failed to connect to db!")
    }
}
export default connectdb;