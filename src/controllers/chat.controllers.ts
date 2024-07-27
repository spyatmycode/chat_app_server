import { Request, Response } from "express";
import { conversationModel } from "../models/conversation.models";
import { userModel } from "../models/user.models";
import mongoose from "mongoose";
import { toObjectId } from "../helpers/mongoose";
import { chatModel } from "../models/chat.models";

export interface CustomRequest extends Request {
    senderID:string
    // Add any other custom properties if needed
}

export interface CustomResponse extends Response {
    json: (body: {
        success: boolean;
        msg: string;
    }) => this;
}

export const getAllConversations = async(req:Request, res:Response)=>{
    try {
        const {senderID:userID} = req as CustomRequest

        console.log(userID);
        

        const findUserConvos = await conversationModel.find({
            participants:{
                $all:[ userID]
            }
        }).populate("chats")

        if(!findUserConvos || findUserConvos.length ===0 ){
            return res.status(200).json({
                success:false,
                msg:"No conversations found"
            })
        }

        console.log(findUserConvos);
        

        return res.status(201).json({
            data:findUserConvos,
            msg:"Conversations found",
            success:true
        })
        

    } catch (error) {
        throw error
    }
}



export const sendChat = async(req:Request, res:Response)=>{
    try {
        const {receiverID} = req.params;

        const {senderID} = req as CustomRequest

        const {message} = req.body


        const checkRecieverIDExists = await userModel.findById(receiverID);

        if(!checkRecieverIDExists) return res.status(404).json({
            msg:"User/Receipient not found",
            success:false
        });

        const createChat = await chatModel.create({
            senderID,
            receiverID,
            message
        })

        console.log({
            senderID,
            receiverID,
            message
        });
        

        const participantsIDs = [
           toObjectId(receiverID),
            toObjectId(senderID)
        ]

        const findConversation = await conversationModel.findOne({
            participants:{
                $all:participantsIDs
            }
        })

        console.log(findConversation);
        

        if(!findConversation || findConversation.chats.length < 1){
            await conversationModel.create({
                chats:[createChat._id],
                participants:participantsIDs,
        
            })


            return res.status(201).json({
                msg:"Message sent successfully",
                success:true
            });
        }

        findConversation.chats = [...findConversation.chats, createChat._id]


        await findConversation.save();

        return res.status(200).json({
            msg:"Message sent successfully",
            success:true
        })



    } catch (error) {

        throw error
        
    }
}


export const getConversationChats = async (req: Request, res: Response)=>{
    try {
        const {senderID} = req as CustomRequest
        const {receiverID} = req.params 

        const messagesInChat = await chatModel.find({
            receiverID,
            
        })


    } catch (error) {
        
    }
}