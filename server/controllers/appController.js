import UserModel from "../model/User.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ENV from '../config.js'; 
import OTP from 'otp-generator';

// middleware for verify user
export async function verifyUser(req, res, next) {
    try {
        const {username} = req.method == "GET" ? req.query : req.body;

        // check the user exist
        let exist = await UserModel.findOne({username});
        if(!exist) 
            return res.status(404).send({error: "Can't find User!"});
        next();
    } catch (error) {
        return res.status(404).send({error: "Authentication Error"});
    }
}

export async function register(req, res) {
    try {
        const {username, password, profile, email} = req.body;

        // check the existing user
        const existUsername = new Promise((resolve, reject) => {
            UserModel.findOne({ username }).then((result) => {
                if(result !== null)
                    reject({ error: "Please use unique Username" });
            }).catch((err) => {
                reject(new Error(err));
            });

            resolve();
        });

        // check the existing email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({ email }).then((result) => {
                if(result !== null)
                    reject({ error: "Please use unique Email" });
            }).catch((err) => {
                reject(new Error(err));
            });

            resolve();
        });

        Promise.all([existUsername, existEmail]).then(() => {
            if(password) {
                bcrypt.hash(password, 10).then((hashedPassword) => {
                    const user = new UserModel({
                        username,
                        password: hashedPassword,
                        profile: profile,
                        email
                    });

                    // return result as a response
                    user.save()
                        .then((result) => res.status(201).send({ msg: "User Register Successfully" }))
                        .catch((err) => res.status(500).send({ err }));

                }).catch((err) => {
                    return res.status(500).send({
                        err: "Enable to hashed password123 " + [...err]
                    });
                })
            }
        }).catch((err) => {
            return res.status(500).send({
                err: "Enable to hashed password456 " + err
            });
        })

    } catch (error) {
        return res.status(500).send(error);
    }
}

export async function login(req, res) {
    const {username, password} = req.body;

    try {
        UserModel.findOne({username})
            .then((user) => {
                bcrypt.compare(password, user.password)
                    .then((passwordCheck) => {
                        if(!passwordCheck)
                            return res.status(400).send({error: "Don't have Password"});

                            // create jwt token
                            const token = jwt.sign({
                                        userId: user._id,
                                        username: user.username
                                    },  ENV.JWT_SECRET
                                    , {expiresIn: "24h"});

                            return res.status(200).send({
                                msg: "Login Successfully...!",
                                username: user.username,
                                token
                            });
                    })
                    .catch((err) => {
                        return res.status(400).send({error: "Password does not Match"});
                    })
            })
            .catch((err) => {
                return res.status(404).send({error: "Username not Found"});
            })
    } catch (error) {
        return res.status(500).send({error});
    }
}

export async function getUser(req, res) {
    const {username} = req.params;

    try {
        if(!username)
            return res.status(501).send({error: "Invalid Username"});

        UserModel.findOne({username})
            .then((user) => {
                if(!user) 
                    return res.status(501).send({error: "Couldn't find the user"});

                const {password, ...rest} = Object.assign({}, user.toJSON()); 
                return res.status(201).send(rest);
            }).catch((err) => {
                res.status(500).send({err});
            })
    } catch (error) {
        return res.status(404).send({error: "Cannot find user data!"});
    }
}

export async function updateUser(req, res) {
    try {
        // const id = req.query.id;
        const {userId} = req.user;

        if(userId) {
            const body = req.body;

            UserModel.updateOne({ _id: userId}, body)
                .then((result) => {
                    return res.status(201).send({msg: "Record Updated...!"});
                })
                .catch((err) => {
                    return err;
                })
        } else {
            return res.status(401).send({error: "User Not Found...!"});
        }
    } catch (error) {
        return res.status(401).send({error});
    }
}

export async function generateOTP(req, res) {
    req.app.locals.OTP = await OTP.generate(6, {lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false});
    res.status(201).send({code: req.app.locals.OTP});
}

export async function verifyOTP(req, res) {
    const {code} = req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        return res.status(201).send({msg: "Verify Successfully...!"});
    }
    return res.status(400).send({error: "Invalid OTP"});
}

// successfully redirect user when OTP is valid
export async function createResetSession(req, res) {
    if(req.app.locals.resetSession) {
        return res.status(201).send({flag: req.app.locals.resetSession});
    }
    return res.status(440).send({error: "Session expired!"});
}

export async function resetPassword(req, res) {
    try {

        if(!req.app.locals.resetSession)
            return res.status(440).send({error: "Session expired!"});

        const {username, password} = req.body;

        try {
            UserModel.findOne({username})
                .then((user) => {
                    bcrypt.hash(password, 10)
                        .then((hashedPassword) => {
                            UserModel.updateOne({username: user.username}, {password: hashedPassword})
                                .then((result) => {
                                    req.app.locals.resetSession = false;
                                    return res.status(201).send({msg: "Record Updated...!"});
                                })
                                .catch((err) => {
                                    return res.status(500).send({
                                        error: "Update Password Failed"
                                    })
                                })
                        })
                        .catch((err) => {
                            return res.status(500).send({
                                error: "Enable to hashed password"
                            })
                        })
                })
                .catch((err) => {
                    return res.status(404).send({error: "Username not found!"});
                })
        } catch (error) {
            return res.status(500).send({error});
        }
    } catch (error) {
        return res.status(401).send({error});
    }
}