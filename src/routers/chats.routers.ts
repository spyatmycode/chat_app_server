import express from 'express'
import {  getAllConversations, sendChat } from '../controllers/chat.controllers';
import { chatMiddleware } from '../middlewares/chat.middlewares';


const router = express.Router();

router.use(chatMiddleware)
router.get('/conversations', getAllConversations)

router.post('/send/:receiverID', sendChat);


export default router

