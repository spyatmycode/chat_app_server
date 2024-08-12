//Package imports
import express, {Application, NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv'
dotenv.config({path:".env.local"})
import cors from 'cors'
import cookieParser from 'cookie-parser';
import lodash from "lodash"




//Local imports 

import { PORT } from './config';
import { connectDB } from './db';
import authRouter from "./routers/auth.routers"
import chatRouter from "./routers/chats.routers"
import userRouter from './routers/user.routers'
import { getGoogleAuthUrl } from './helpers/auth';





//App begins

const app:Application = express()

app.use(cors({
    origin: ['http://localhost:5173','https://chat-app-client-livid.vercel.app', 'chat-app-client-git-main-spyatmycodes-projects.vercel.app', 'chat-app-client-63ric2obm-spyatmycodes-projects.vercel.app'], // Replace with your frontend URL
    credentials: true // Allow cookies to be sent and received
}));

app.use(express.json())
app.use(cookieParser())

//Middlewares
//logger

app.use(async(req:Request, res:Response, next:NextFunction)=>{
    console.log("logger",req.method, req.path,req.body);

    next()
    
})



app.use(async(req:Request, res:Response, next:NextFunction)=>{

    
    let canProgress = true
    let undefinedKey = ""

        Promise.all(Object.entries(req.body).map(([key, value])=>{

            if(value === undefined){
                
                canProgress = false
                undefinedKey = key
                return res.status(400).json({
                    success: canProgress,
                    msg:`Please enter all inputs correctly ${undefinedKey}`
                })
            }

        }))

  
        next();

        
    })/*  */
app.use("/api/auth",authRouter);
app.use("/api/chat",chatRouter )
app.use("/api/users",userRouter )

//Rest of app


app.get("/", (_, res: Response)=>{

    res.status(200).json({
        status:"OK",
        msg:"You have hit the home route"
    })

});






app.listen (PORT, ()=>{
    console.log(`App is listening on ${PORT}`);
    connectDB()
    
})




