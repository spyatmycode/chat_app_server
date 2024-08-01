import { GOOGLE_AUTH_REDIRECT_URL, GOOGLE_AUTH_TOKEN_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config"
import axios from "axios"
import querystring from "qs"


export const getGoogleAuthToken = async(code:string)=>{

    const options = {
        code,
        client_id:GOOGLE_CLIENT_ID,
        client_secret:GOOGLE_CLIENT_SECRET,
        redirect_uri:GOOGLE_AUTH_REDIRECT_URL,
        grant_type:'authorization_code'
    }


    try {

        

        const res = await axios.post(GOOGLE_AUTH_TOKEN_URL, querystring.stringify(options), {
            headers:{
                'Content-Type':'application/x-www-form-urlencoded'
            }
        } )
        
        return res.data
    } catch (error:any) {
        console.error(error?.message);
    }

}