import mongoose from "mongoose";


const chatSchema = new mongoose.Schema({

    message:{
        type:String,
        minlength: 1
    },
    senderID:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    receiverID:{
        type: mongoose.Schema.Types.ObjectId,
        required:true

    }

},{
    timestamps:true
})

export const chatModel = mongoose.model("Chats", chatSchema)