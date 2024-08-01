
import { GOOGLE_AUTH_REDIRECT_URL, GOOGLE_CLIENT_ID, GOOGLE_ROOT_URL } from "../config"


export const getGoogleAuthUrl = ()=>{
    const rootUrl = GOOGLE_ROOT_URL

    const options = {
        redirect_uri:GOOGLE_AUTH_REDIRECT_URL as string,
        client_id: GOOGLE_CLIENT_ID as string,
        access_type:'offline',
        response_type:'code',
        prompt:'consent',
        scope:[
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(" ")
    }

    const qs = new URLSearchParams(options)

    return `${rootUrl}?${qs.toString()}`


}

