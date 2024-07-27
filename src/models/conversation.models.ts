import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema({

    participants:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'Users',
        required:true
    },
    chats:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'Chats',
    }
    

},{
    timestamps:true
})

export const conversationModel = mongoose.model("Conversations", conversationSchema)