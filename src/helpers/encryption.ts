import bcrypt from "bcryptjs"
import jsonwebtoken from "jsonwebtoken"
import { JWT_REFRESH_SECRET, JWT_SECRET, NODE_ENV } from "../config"
import {Response} from 'express'


export const hashPassword = (password:string) =>{

    try {
        const salt =  bcrypt.genSaltSync(10)
        return  bcrypt.hashSync(password, salt)
    } catch (error) {
        throw error
    }

}

export const confirmPassword = (password:string, passwordHash:string) =>{
    try {
        return bcrypt.compareSync(password, passwordHash)
    } catch (error) {
        throw error
    }
}

export const generateJWTToken = (res:Response,...rest:any)=>{


    try {

        const accessToken = jsonwebtoken.sign(Object.assign({}, ...rest), JWT_SECRET,{
            expiresIn:"1hr"
        });

        const refreshToken = jsonwebtoken.sign(Object.assign({}, ...rest),JWT_REFRESH_SECRET,{
            expiresIn:"1d"
        } )

        res.cookie("refreshToken", refreshToken, {
            httpOnly:true, // only accessible via http and prevent xss attach
            maxAge:24*60*60*1000, //1 hour
            sameSite:"strict", // prevent csfr attach
            secure: true//NODE_ENV === "production"
        })


        return {accessToken, refreshToken}
    } catch (error) {
        throw error
    }

}

