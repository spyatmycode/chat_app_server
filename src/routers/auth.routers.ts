import express from "express";
import { checkForCompleteProfile, completeUserProfile, getRefreshToken, googleAuth, login, logout, signup } from "../controllers/auth.controllers";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = express.Router();


router.post("/login", login)

router.get("/logout", logout);

router.post("/signup", signup);

router.get("/google", googleAuth);

router.post("/refresh", getRefreshToken);

router.post("/complete-profile", authMiddleware ,completeUserProfile).get("/complete-profile", authMiddleware,checkForCompleteProfile);



export default router