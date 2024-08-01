import mongoose from "mongoose";

const userSchema =new mongoose.Schema({

    username:{
        type: String,
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
        enum:["male", "female", null]
    },
    password:{
        type:String,
        minlength:6  
    },
    profilePicture:{
        type:String,
        default:""
        
    },
    completedProfile:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String,
    }

},{
    timestamps:true
})


export const userModel = mongoose.model('Users', userSchema)