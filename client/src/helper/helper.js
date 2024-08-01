import axios from 'axios';
import * as jwt_decode from 'jwt-decode';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/** Make API Request */

// get username from token
export async function getUserNameByToken() {
    const token = localStorage.getItem('token');
    if(!token) 
        return Promise.reject({error: "Cannot find Token"});

    let decoded = jwt_decode.jwtDecode(token);
    return decoded;
}

// Authenticate function
export async function authenticate(username) {
    try {
        return await axios.post('/api/authenticate', {username})
    } catch (error) {
        return {error: "Username doesn't exist...!"}
    }
}

// get user details
export async function getUser({username}) {
    try {
        const {data} = await axios.get(`/api/user/${username}`);
        return {data};
    } catch (error) {
        return {error: "Password doesn't match...!"}
    }
}

// register user function
export async function registerUser(credentials) {
    try {
        const {data: {msg}, status} = await axios.post(`/api/register`, credentials);
        let {username, email} = credentials;

        // send email
        if(status === 201) {
            await axios.post(`/api/registerMail`, {username, userEmail: email, text: msg});
        } 

        return Promise.resolve(msg);

    } catch (error) {
        return Promise.reject({error});
    }
}

// login function 
export async function verifyPassword({username, password}) {
    try {
        if(username) {
            const {data} = await axios.post('/api/login', {username, password});
            return Promise.resolve({data});
        }
    } catch (error) {
        // return Promise.reject({status: false, error: "Password doesn't match"});
        return Promise.reject({error: "Password doesn't match13132"});
    }
}

// update user
export async function updateUser(response) {
    try {
        const token = await localStorage.getItem('token');
        const data = await axios.put(`/api/update-user`, response, {headers: {"Authorization": `Bearer ${token}`}});

        return Promise.resolve({data});
    } catch (error) {
        return Promise.reject({error: "Couldn't update profile...!"});
    }
}

// generate OTP
export async function generateOTP(username) {
    try {
        const {data: {code}, status} = await axios.get('/api/generateOTP', {params: {username}});
        if(status === 201) {
            let {data: {email}} = await getUser({username});
            let text = `Your Password Recovery OTP is ${code}. Verify and recover your password.`;
            await axios.post('/api/registerMail', {username, userEmail: email, text, subject: "Password Recovery OTP"});
        }
        return Promise.resolve(code);
    } catch (error) {
        return Promise.reject({error: `Error for generate OTP by ${error}`});
    }
}

// verify OTP
export async function verifyOTP({username, code}) {
    try {
        const {data, status} = await axios.get('/api/verifyOTP', {params: {username, code}});
        return Promise.resolve({data, status});
    } catch (error) {
        return Promise.reject(error);
    }
}

// reset password
export async function resetPassword({username, password}) {
    try {
        const {data, status} = await axios.put('/api/reset-password', {username, password});
        return Promise.resolve({data, status});
    } catch (error) {
        return Promise.reject({error: "Reset Password failed by " + error});
    }
}