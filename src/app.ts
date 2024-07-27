//Package imports
import express, {Application, Request, Response} from 'express';
import dotenv from 'dotenv'
dotenv.config({path:".env.local"})
import cors from 'cors'
import cookieParser from 'cookie-parser';




//Local imports 

import { PORT } from './config';
import { connectDB } from './db';
import authRouter from "./routers/auth.routers"
import chatRouter from "./routers/chats.routers"
import userRouter from './routers/user.routers'





//App begins

const app:Application = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())

//Middlewares

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




