import express from 'express'
import {  getAllConversations, getChatsForConversation, sendChat } from '../controllers/chat.controllers';
import { authMiddleware } from '../middlewares/auth.middlewares';


const router = express.Router();

router.use(authMiddleware)
router.get('/conversations' ,getAllConversations)

router.post('/send/:receiverID', sendChat)

router.get("/conversations/:recieverID",getChatsForConversation )


export default router

