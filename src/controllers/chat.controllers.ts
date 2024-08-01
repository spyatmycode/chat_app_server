import { Request, Response } from "express";
import { conversationModel } from "../models/conversation.models";
import { userModel } from "../models/user.models";
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

export const getAllConversations = async (req: Request, res: Response) => {
    try {


        const { senderID: userID } = req as CustomRequest;


        const findUserConvos:any = await conversationModel.find({
            participants: {
                $all: [userID],
            
            }
        }).populate("chats").populate({path:"participants", select:"username _id profilePicture"});

        const user =await  userModel.findById(userID).select("profilePicture username")

        


       

        if(findUserConvos && findUserConvos?.length === 0){
            

            return res.status(200).json({
                user,
                success: false,
                msg: "No conversations found"
            });
        }

        const filteredConvos = findUserConvos.map(({participants,chats }:any)=>{

                   

            const receiver = participants.find(({_id}:{_id:string})=> _id.toString()!==userID);

            

            const lastMessage = chats.sort((a:any,b:any)=>{
                
                const aDate :any= new Date(a.createdAt)
                const bDate:any = new Date(b.createdAt)

               
                return aDate - bDate


            }).slice(-1)[0]

           
            


            return {
                receiver,
                lastMessage
            }

        })


        return res.status(200).json({
            user,
            data: filteredConvos,
            msg: "Conversations found",
            success: true
        });

    } catch (error) {
        console.error(error);
        
        res.status(500).json({
            msg:"Internal Server Error",
            success:false
        })
    }
};

export const sendChat = async(req:Request, res:Response)=>{
    try {
        const {receiverID} = req.params;

        const {senderID} = req as CustomRequest

        const {message} = req.body

        if(receiverID === senderID){
            return res.status(400).json({
                msg:"Cannot send message to self at this time.",
                success:false
            })
        }


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

        

        const participantsIDs = [
           toObjectId(receiverID),
            toObjectId(senderID)
        ]

        const findConversation = await conversationModel.findOne({
            participants:{
                $all:participantsIDs
            }
        })

        

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



    } catch (error:any) {
        console.error(error?.message);
        res.status(500).json({
            success:false,
            msg:error?.message
        })
        
    }
}


export const getChatsForConversation = async(req:Request, res:Response)=>{
    try {

        const {senderID:userID} = req as any
        const {recieverID} = req.params


        const findConversation:any = await conversationModel.findOne({
            participants: {
                $all: [recieverID, userID],
            
            }
        }).populate("chats").populate({path:"participants", select:"username _id profilePicture"});

        const findReceiver = await userModel.findById(recieverID).select("username _id profilePicture")

        if(!findConversation || findConversation?.chats?.length === 0){
           
            return res.status(200).json({
                data:{
                    receiver:findReceiver,
                    chats:[]
                },
                success: false,
                msg: "No conversations found"
            });
        }

          const modifiedChat = {
            receiver: findConversation?.participants?.find(({_id}:{_id:string})=> _id.toString()!==userID),
            chats:findConversation.chats.map((chat:any)=>{

                    return {

                ...chat._doc,
                position: chat?._doc.senderID.toString() === userID ? "end":"start"

            }}).sort((a:any,b:any)=>{
                
                const aDate :any= new Date(a.createdAt)
                const bDate:any = new Date(b.createdAt)

               
                return aDate - bDate


            })
          }
        

        return res.status(200).json({
            data: modifiedChat,
            msg: "Conversations found",
            success: true
        });


    } catch (error:any) {
        console.error(error?.message);
        res.status(500).json({
            success:false,
            msg:error?.message
        })
        
    }
}


