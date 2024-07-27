import bcrypt from "bcryptjs"
import jsonwebtoken from "jsonwebtoken"
import { JWT_SECRET, NODE_ENV } from "../config"
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

        const secureToken = jsonwebtoken.sign(Object.assign({}, ...rest), JWT_SECRET,{
            expiresIn:"1hr"
        })

        res.cookie("token", secureToken, {
            httpOnly:true, // only accessible via http and prevent xss attach
            maxAge:60*60*1000, //1 hour
            sameSite:"strict", // prevent csfr attach
            secure: NODE_ENV === "production"
        })


        return secureToken
    } catch (error) {
        throw error
    }

}

