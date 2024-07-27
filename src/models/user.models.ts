import mongoose from "mongoose";

const userSchema =new mongoose.Schema({

    username:{
        type: String,
        required:true,
        unique:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phoneNumber:{
        type:String,
        unique:true
    },
    gender:{
        type:String,
        enum:["male", "female"]
    },
    password:{
        type:String,
        minlength:6  
    },
    profilePicture:{
        type:String,
        default:""
        
    }

},{
    timestamps:true
})


export const userModel = mongoose.model('Users', userSchema)