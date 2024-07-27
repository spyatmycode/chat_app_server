import express from 'express'
import { chatMiddleware } from '../middlewares/chat.middlewares';
import { findUsers } from '../controllers/user.controllers';

const router = express.Router();

router.use(chatMiddleware);

router.get('/search', findUsers);

export default router