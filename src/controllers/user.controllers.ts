import { Request, Response } from "express";
import { userModel } from "../models/user.models";



export const findUsers = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        

        const { username: loggedinusername } = req as any

        const foundUsers = await userModel.find({
            $or: [
                { username: { $regex: username, $options: 'i' } },
                { firstName: { $regex: username, $options: 'i' } },
                { lastName: { $regex: username, $options: 'i' } },
                { email: { $regex: username, $options: 'i' } }
            ],
        }).select("username _id profilePicture");

        if (!foundUsers || foundUsers?.length === 0) {
            return res.status(200).json({
                msg: `No userfound with ${username}`,
                success: false,
                data: foundUsers
            })
        }

        const filteredUsers = foundUsers.filter(({username}:any)=> username?.toString()?.toLowerCase() !== loggedinusername?.toString()?.toLowerCase() )

        return res.status(200).json({
            msg: `Here are the ${filteredUsers?.length} results`,
            success: false,
            data: filteredUsers
        })



    } catch (error:any) {
        console.error(error)
        return res.status(500).json({
            success:false,
            msg:error?.message
        })
    }
}