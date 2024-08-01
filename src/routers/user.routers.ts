import express from 'express'
import { authMiddleware } from '../middlewares/auth.middlewares';
import { findUsers } from '../controllers/user.controllers';

const router = express.Router();

router.use(authMiddleware);

router.get('/search/:username', findUsers);

export default router