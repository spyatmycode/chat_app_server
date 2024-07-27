import { Request, Response } from "express"
import validator from "validator"
import { userModel } from "../models/user.models"
import { confirmPassword, generateJWTToken, hashPassword } from "../helpers/encryption"


type signupDataType = {
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string
    phoneNumber?: string,
    gender?: string
}


export const login = async (req: Request, res: Response) => {

    try {
        const { username, email, password }: { username?: string, email?: string, password: string } = req.body

        const user = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            })
        }

        const passwordMatch = confirmPassword(password, user.password || "")

        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                msg: "Invalid credentials"
            })
        }

        generateJWTToken(res, {email: user.email},{_id:user._id},{username})

        return res.status(200).json({

            success: true,
            msg: `Welcome ${user.firstName}`

        })


    } catch (error) {
        throw error
    }

}

export const logout = async (_: any, res: Response) => {

    try {
        res.cookie("token", "", {
            maxAge: 0
        })
        return res.status(200).json({ success: true, msg: "Logout successful." })
    } catch (error) {
        throw error
    }

}



export const signup = async (req: Request, res: Response) => {

    try {

        const { firstName, lastName, email, password, confirmPassword, phoneNumber, gender, username }: signupDataType = req.body

        const passwordIsStrong = validator.isStrongPassword(password, {
            minLength: 6,
            pointsForContainingSymbol: 0,
            pointsForContainingUpper: 0
        })

        const emailIsValid = validator.isEmail(email)

        if (!passwordIsStrong || !emailIsValid) {
            return res.status(400).json({
                success: false,
                msg: "Either password is not strong enough or email is invalid"
            })
        }



        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                msg: "Passwords do not match!"
            })
        }

        const userExists = await userModel.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                msg: "User already exists!"
            })
        }

        const profilePic = gender === "male" ? `https://avatar.iran.liara.run/public/boy?username=${username}` : `https://avatar.iran.liara.run/public/girl?username=${username}`

        const newUser = await userModel.create({
            firstName,
            lastName,
            email,
            gender,
            profilePicture: profilePic,
            phoneNumber,
            username,
            password: hashPassword(password)

        })

        return res.status(201).json({
            msg: "User created successfully",
            success: true,
            token: generateJWTToken(res,{email:newUser.email}, {_id:newUser._id}, {username})
        })



    } catch (error) {
        console.log(error);
        throw error
    }

}
