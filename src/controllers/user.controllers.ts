import { Request, Response } from "express";
import { userModel } from "../models/user.models";



export const findUsers = async(req: Request, res:Response)=>{
    try {
        const {username} = req.body;
        const {username:loggedinusername} = req as any

        const foundUser = await userModel.find({
            username: { $regex: username, $ne:loggedinusername}
          });

        if(!foundUser){
            return res.status(200).json({
                msg:`No userfound with ${username}`,
                success:false,
                data:foundUser
            })
        }

        return res.status(200).json({
            msg:`Here are the ${foundUser.length} results`,
            success:false,
            data:foundUser
        })



    } catch (error) {
        throw error
    }
}