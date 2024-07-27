import express from "express";
import { login, logout, signup } from "../controllers/auth.controllers";

const router = express.Router();


router.post("/login", login)

router.get("/logout", logout);

router.post("/signup", signup);


export default router