import { Timestamp } from "mongodb"
import mongoose from "mongoose"

const schema = new mongoose.Schema({
    name:{
     type: String,
     required: true,
     lowercase: true,
      trim: true,
      index: true,
        },

        email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true},

      password: {
      type: String,
      required: [true, "Password is required"]
    },

    role:{
        type:String,
        default:"user"
     }
},

{Timestamp:true}
)

export const User = mongoose.model("User",schema)