import { Request, Response } from "express"
import validator from "validator"
import { userModel } from "../models/user.models"
import { confirmPassword, generateJWTToken, hashPassword } from "../helpers/encryption"
import { getGoogleAuthToken } from "../services/auth.services"
import jsonwebtoken from 'jsonwebtoken';
import { CLIENT_BASE_URL, GOOGLE_CLIENT_SECRET, JWT_REFRESH_SECRET, JWT_SECRET } from "../config"




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
        const { usernameOrEmail, password }: { usernameOrEmail?: string, email?: string, password: string } = req.body

        const user = await userModel.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
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

        const { accessToken, refreshToken } = generateJWTToken(res, { email: user.email }, { _id: user._id }, { username: user.username });

        user.refreshToken = refreshToken

        await user.save()


        return res.status(200).json({

            success: true,
            msg: `Welcome ${user.firstName}`,
            accessToken

        })


    } catch (error) {
        throw error
    }

}

export const logout = async (_: any, res: Response) => {

    try {
        res.cookie("refreshToken", "", {
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

        const userExists = await userModel.findOne({
            $or: [
                { email }, { username }
            ]
        });

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
            password: hashPassword(password),
            completedProfile:true

        })

        const accessToken = generateJWTToken(res, { email: newUser.email }, { _id: newUser._id }, { username })

        return res.status(201).json({
            msg: "User created successfully",
            success: true,
            accessToken
        })



    } catch (error:any) {
        console.error(error?.message);
        res.status(500).json({
            success:false,
            msg:error?.message
        })
        
    }

}


export const checkForCompleteProfile = async(req:Request, res:Response)=>{
    try {
        const {senderID:userID} = req as any;

        const findUser = await userModel.findById(userID);

        if(findUser?.completedProfile){
            return res.status(401).json({
                msg:"Profile already completed",
                success:false
            })
        }

        return res.status(200).json({
            msg:"Proceed with profile completion",
            success:true
        })


    } catch (error:any) {
        console.error(error)
        return res.status(500).json({msg:`Internal server error; ${error?.message} `})
    }
}

export const completeUserProfile = async (req: Request, res: Response) => {
    try {
        const { senderID: userID } = req as any;

        
        const { password, confirmPassword, gender, phoneNumber, username }: any = req.body;

        const findUser = await userModel.findById(userID);

        const existingUserName = await userModel.findOne({username: username})

        if (existingUserName?.username === username) {
           
            
            return res.status(200).json({
                success: false,
                msg: "Username already in use"
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                msg: "Passwords do not match"
            })
        }



        const {refreshToken, accessToken} = generateJWTToken(res, {_id:findUser?._id})

        Object.assign(findUser as Object, { password: hashPassword(password), gender, phoneNumber, username, refreshToken, completedProfile:true });

        await findUser?.save();

        return res.status(200).json({
            msg:`Profile completed successfully. Welcome ${findUser?.firstName}`,
            success:true,
            accessToken
        })

    } catch (error:any) {
        return res.status(500).json({
            success:false,
            msg: error?.message
        })
    }
}



export const googleAuth = async (req: Request, res: Response) => {
    try {
        const code = req.query.code as string

        const { id_token, access_token } = await getGoogleAuthToken(code);


        const { email, family_name, given_name, picture, email_verified }: any = jsonwebtoken.decode(id_token)

        const user = await userModel.findOne({
            $or: [
                { email }
            ]
        })

        if (user && email_verified) {

           

            const { refreshToken } = generateJWTToken(res, { email: user.email }, { _id: user._id }, { username: user.username });

            user.refreshToken = refreshToken;
    
            await user.save()

            return res.redirect(`${CLIENT_BASE_URL}`)


        }




        const newUser = await userModel.create({
            email,
            firstName: given_name,
            lastName: family_name,
            profilePicture: picture,
            

        });

        const {refreshToken}= generateJWTToken(res, { email }, { _id: newUser._id });

        newUser.refreshToken = refreshToken;

        await newUser.save();

       
        return res.redirect(`${CLIENT_BASE_URL}/complete-profile`);





    } catch (error:any) {
        console.error(error?.message);
        res.status(500).json({
            success:false,
            msg:error?.message
        })
        
    }
}


export const getRefreshToken = async (req: Request, res: Response) => {
    try {

        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(403).json({
                msg: "Refresh token missing",
                success: false
            })
        }

       
        

        const { _id } = jsonwebtoken.verify(refreshToken, JWT_REFRESH_SECRET) as any;

        const user = await userModel.findById(_id);

        if (!user || user.refreshToken !== refreshToken) {
           
            
            return res.status(403).json({
                msg: "Log out at this point",
                success: false
            });
        }

        const {accessToken:newAccessToken, refreshToken:newRefreshToken} = generateJWTToken(res, {_id:user._id});

        

        user.refreshToken = newRefreshToken;

        await user.save();

        

        return res.status(200).json({
            msg:"Token successfully refreshed",
            success:true,
            accessToken:newAccessToken
        });





    } catch (error:any) {
        console.error(error?.message);
        res.status(500).json({
            success:false,
            msg:error?.message
        })
        
    }
}