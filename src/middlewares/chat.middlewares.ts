import { Request, Response, NextFunction } from "express";
import  jsonwebtoken  from 'jsonwebtoken';
import { JWT_SECRET } from "../config";



export const chatMiddleware = async (req: any, res: Response, next: NextFunction)=>{

    try {
        const token = req.cookies.token



        const {_id, username} = jsonwebtoken.verify(token, JWT_SECRET) as any;

        if(!_id)
            return res.status(400).json({
        success:false, msg:"Unauthorized"})

        req.senderID = _id
        req.username = username

        next()


        
    
    } catch (error) {
        throw error;
    }

}