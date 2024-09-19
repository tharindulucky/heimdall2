import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {errorMessage} from "../interfaces/ErrorResponse";
import {User} from "../models/User";
import {RequestHandler} from "express";
import configs from "../configs";
import {IUser} from "../interfaces/types";
import {sendEmail} from "../utils/mailer";
import {pushToQueue} from "../utils/queueService";
import {writeLog} from "../utils/logger";

export const signUp: RequestHandler = async (req, res) => {
  const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8)
  }).options({abortEarly: false, errors: {label: false}});

  const {error} = schema.validate(req.body);
  if(error)
      return res.status(400).json({
          message: "Validation error",
          body: errorMessage(error)
      });

    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if(user)
            return res.status(400).json({
                message: "Email already exist!",
                body:[
                    {
                        field: "",
                        errorCode: 400,
                        message: "Email already exist!"
                    }
                ]
            });

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            userType: "user",
            nextAction: 'verifyEmail'
        });

      const savedUser = await newUser.save();

      return res.status(201).json({
          message: "Success",
          body: {
              id: savedUser._id,
              email: savedUser.email,
              userType: savedUser.userType,
              nextAction: 'verifyEmail'
          }
      });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}

export const signIn: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(8)
    }).options({abortEarly: false, errors: {label: false}});

    const {error} = schema.validate(req.body);
    if(error)
        return res.status(400).json({
            message: "Validation error",
            body: errorMessage(error)
        });

    try {
        const user: IUser | null = await User.findOne({email: req.body.email});
        if(!user)
            return res.status(400).json({
                message: "Email/Password invalid!",
                body:[
                    {
                        field: "",
                        errorCode: 400,
                        message: "Email/Password invalid!"
                    }
                ]
            });

        if(user && !bcrypt.compareSync(req.body.password, user.password))
            return res.status(400).json({
                message: "Email/Password invalid!",
                body:[
                    {
                        field: "",
                        errorCode: 400,
                        message: "Email/Password invalid!"
                    }
                ]
            });

        if(user && user?.status != "active")
            return res.status(400).json({
                message: "Inactive user!",
                body:[
                    {
                        field: "",
                        errorCode: 400,
                        message: "Inactive user!"
                    }
                ]
            });

        if(user){
            const accessToken = jwt.sign({
                authUserId: user?._id,
                email: user?.email,
                authUserType: user?.userType
            }, configs.jwt_secret, {expiresIn:3600 * 24});

            const refreshToken = jwt.sign({
                authUserId: user?._id,
                email: user?.email,
                authUserType: user?.userType
            }, configs.jwt_secret, {expiresIn:3600 * 24});

            await user.updateOne({refreshToken: refreshToken});

            return res.status(200).json({
                message: "Success",
                body:{
                    userId: user?._id,
                    userType: user?.userType,
                    email: user?.email,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    nextAction: "home"
                }
            });
        }

        return res.status(400).json({
            message: "Email/Password invalid!",
            body:[
                {
                    field: "",
                    errorCode: 400,
                    message: "Email/Password invalid!"
                }
            ]
        });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}

export const sendEmailVerification: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().required(),
        verificationType: Joi.string().required().valid("hash", "code")
    }).options({abortEarly: false, errors: {label: false}});

    const {error} = schema.validate(req.body);
    if(error)
        return res.status(400).json({
            message: "Validation error",
            body: errorMessage(error)
        });

    try {
        const user: IUser | null = await User.findOne({
            email: req.body.email,
        });
        if(user && !user.emailVerified){
            let verificationHash = null;
            let verificationCode = null;
            if(req.body.verificationType == "hash"){
                if(user.emailVerificationHash == null){
                    const uniqueString = user.email + Date.now();
                    const salt = bcrypt.genSaltSync(10);
                    verificationHash = bcrypt.hashSync(uniqueString, salt);
                    user.emailVerificationHash = verificationHash;
                    await user?.save();
                    await sendEmail("EmailVerificationRequest", {
                        toAddress: user.email,
                        toName: user.name,
                        data: {
                            verificationHash: verificationHash
                        }
                    });
                }else{
                    await sendEmail("EmailVerificationRequest", {
                        toAddress: user.email,
                        toName: user.name,
                        data: {
                            verificationHash: user.emailVerificationHash
                        }
                    });
                }
            }else if(req.body.verificationType == "code"){
                if(user.emailVerificationCode == null){
                    verificationCode = Math.floor(Math.random() * 1000000);
                    user.emailVerificationCode = verificationCode;
                    await user?.save();
                    await sendEmail("EmailVerificationRequest", {
                        toAddress: user.email,
                        toName: user.name,
                        data: {
                            verificationHash: verificationCode
                        }
                    });
                }else {
                    await sendEmail("EmailVerificationRequest", {
                        toAddress: user.email,
                        toName: user.name,
                        data: {
                            verificationHash: user.emailVerificationCode
                        }
                    });
                }
            }

            return res.status(200).json({
                message: "Email verification email sent!"
            });
        }

        return res.status(400).json({
            message: "Email not found or already verified!",
            body:[
                {
                    field: "",
                    errorCode: 400,
                    message: "Email not found or already verified!"
                }
            ]
        });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}

export const verifyEmail: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        verificationHashOrCode: Joi.string().required(),
        verificationType: Joi.string().required().valid("hash", "code")
    }).options({abortEarly: false, errors: {label: false}});

    const {error} = schema.validate(req.body);
    if(error)
        return res.status(400).json({
            message: "Validation error",
            body: errorMessage(error)
        });

    try {
        const user: IUser | null = await User.findOne({
            email: req.body.email
        });
        if(user){
            if(req.body.verificationType == "hash" && user.emailVerificationHash == req.body.verificationHashOrCode){
                user.emailVerificationHash = null;
            }else if(req.body.verificationType == "code" && user.emailVerificationCode == req.body.verificationHashOrCode){
                user.emailVerificationCode = null;
            }else{
                return res.status(400).json({
                    message: "Invalid or expired verification details!",
                    body:[
                        {
                            field: "",
                            errorCode: 400,
                            message: "Invalid or expired verification details!"
                        }
                    ]
                });
            }
            user.emailVerified = true;
            user.status = "active";
            await user?.save();

            await sendEmail("EmailVerificationComplete", {
                toAddress: user.email,
                toName: user.name,
                data: null
            });

            return res.status(200).json({
                message: "Email verification successful!"
            });
        }

        return res.status(400).json({
            message: "Email not found on the system!",
            body:[
                {
                    field: "",
                    errorCode: 400,
                    message: "Email not found on the system!"
                }
            ]
        });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}

export const sendResetPasswordEmail: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().required(),
        verificationType: Joi.string().required().valid("hash", "code")
    }).options({abortEarly: false, errors: {label: false}});

    const {error} = schema.validate(req.body);
    if(error)
        return res.status(400).json({
            message: "Validation error",
            body: errorMessage(error)
        });

    try {
        const user: IUser | null = await User.findOne({
            email: req.body.email,
            status: 'active'
        });

        if(user){
            let passwordResetHash = null;
            let passwordResetCode = null;
            if(req.body.verificationType == "hash"){
                if(user.passwordResetCode == null){
                    const uniqueString = user.email + Date.now();
                    const salt = bcrypt.genSaltSync(10);
                    passwordResetHash = bcrypt.hashSync(uniqueString, salt);
                    user.passwordResetHash = passwordResetHash;
                    await user?.save();
                    await sendEmail("PasswordResetRequest", {
                        toAddress: user.email,
                        toName: user.name,
                        data: {
                            verificationHash: passwordResetHash
                        }
                    });
                    writeLog('INFO', `PasswordResetRequest - hash new - Sent to EmailQueue`, null);
                }else{
                    await sendEmail("PasswordResetRequest", {
                        toAddress: user.email,
                        toName: user.name,
                        data: {
                            verificationHash: user.passwordResetHash
                        }
                    });
                    writeLog('INFO', `PasswordResetRequest - hash old - Sent to EmailQueue`, null);
                }
            }else if(req.body.verificationType == "code"){
                if(user.passwordResetCode == null){
                    passwordResetCode = Math.floor(Math.random() * 1000000);
                    user.passwordResetCode = passwordResetCode;
                    await user?.save();
                    await sendEmail("PasswordResetRequest", {
                        toAddress: user.email,
                        toName: user.name,
                        data: {
                            verificationHash: passwordResetCode
                        }
                    });
                    writeLog('INFO', `PasswordResetRequest - code new- Sent to EmailQueue`, null);
                }else {
                    await sendEmail("PasswordResetRequest", {
                        toAddress: user.email,
                        toName: user.name,
                        data: {
                            verificationHash: user.passwordResetCode
                        }
                    });
                    writeLog('INFO', `PasswordResetRequest - code old - Sent to EmailQueue`, null);
                }
            }

            return res.status(200).json({
                message: "Password reset email sent!"
            });
        }

        return res.status(400).json({
            message: "Email not found on the system!",
            body:[
                {
                    field: "",
                    errorCode: 400,
                    message: "Email not found on the system!"
                }
            ]
        });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}

export const resetPassword: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        verificationType: Joi.string().required().valid("hash", "code"),
        verificationHashOrCode: Joi.string().required(),
        newPassword: Joi.string().required().min(8),
    }).options({abortEarly: false, errors: {label: false}});

    const {error} = schema.validate(req.body);
    if(error)
        return res.status(400).json({
            message: "Validation error",
            body: errorMessage(error)
        });

    try {
        const user: IUser | null = await User.findOne({
            email: req.body.email
        });
        if(user){
            if(req.body.verificationType == "hash" && user.passwordResetHash == req.body.verificationHashOrCode){
                user.passwordResetHash = null;
            }else if(req.body.verificationType == "code" && user.passwordResetCode == req.body.verificationHashOrCode){
                user.passwordResetCode = null;
            }else{
                return res.status(400).json({
                    message: "Invalid or expired verification details!",
                    body:[
                        {
                            field: "",
                            errorCode: 400,
                            message: "Invalid or expired verification details!"
                        }
                    ]
                });
            }
            user.password = bcrypt.hashSync(req.body.newPassword, 8);
            await user?.save();

            await sendEmail("PasswordResetComplete", {
                toAddress: user.email,
                toName: user.name,
                data: null
            });

            return res.status(200).json({
                message: "Password reset successful!"
            });
        }

        return res.status(400).json({
            message: "Email not found on the system!",
            body:[
                {
                    field: "",
                    errorCode: 400,
                    message: "Email not found on the system!"
                }
            ]
        });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}

export const changePassword: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        authUserId: Joi.string().required(),
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required().min(8).label('Password'),
        confirmPassword: Joi.string().required().min(8).valid(Joi.ref('newPassword'))
            .label('Confirm password').messages({ 'any.only': ' - Passwords do not match!' })
    }).options({abortEarly: false, errors: {label: false}});

    const {error} = schema.validate(req.body);
    if(error)
        return res.status(400).json({
            message: "Validation error",
            body: errorMessage(error)
        });

    try {
        const user: IUser | null = await User.findById(req.body.authUserId);
        if(!user)
            return res.status(400).json({
                message: "User not found!",
                body:[
                    {
                        field: "",
                        errorCode: 400,
                        message: "User not found!"
                    }
                ]
            });

        if(user && !bcrypt.compareSync(req.body.oldPassword, user.password))
            return res.status(400).json({
                message: "Current password is invalid!",
                body:[
                    {
                        field: "",
                        errorCode: 400,
                        message: "Current password is invalid!"
                    }
                ]
            });

        if(user){
            user.password = bcrypt.hashSync(req.body.newPassword, 8);
            await user.save();

            await sendEmail("PasswordUpdateComplete", {
                toAddress: user.email,
                toName: user.name,
                data: null
            });

            writeLog('INFO', `Password updated`, null);
            return res.status(400).json({
                message: "Password updated successfully!"
            });
        }

        return res.status(400).json({
            message: "User not found!",
            body:[
                {
                    field: "",
                    errorCode: 400,
                    message: "User not found!"
                }
            ]
        });
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}

export const authenticate: RequestHandler = async (req, res) => {
    const schema = Joi.object({
        authorization: Joi.string().required()
    }).options({abortEarly: false, errors: {label: false}, allowUnknown: true});

    const {error} = schema.validate(req.headers);
    if(error)
        return res.status(400).json({
            message: "Validation error",
            body: errorMessage(error)
        });

    try {
        const authHeader = req.headers.authorization;
        if(authHeader){
            const headers = authHeader.split(' ');
            const token = headers.length > 1 ? headers[1] : headers[0];

            if(!token) return res.status(401).json({"message": "No token provided!"});

            jwt.verify(token, configs.jwt_secret, async (err, decodedData) => {
                if(err) return res.status(401).json({"message": "Unauthorized!"});

                if(decodedData && typeof decodedData !== "string"){
                    const user: IUser | null = await User.findOne({
                        _id: decodedData._id
                    });

                    if(!user)
                        return res.status(400).json({
                            message: "Unauthorized!",
                            body:[
                                {
                                    field: "",
                                    errorCode: 400,
                                    message: "Unauthorized!"
                                }
                            ]
                        });

                    if(user.status != "active")
                        return res.status(400).json({
                            message: "Unauthorized!",
                            body:[
                                {
                                    field: "",
                                    errorCode: 400,
                                    message: "Unauthorized!"
                                }
                            ]
                        });

                    return res.status(200).json({
                        message: "Success!",
                        body: {
                            _id: user?._id,
                            email: user?.email,
                            nextAction: "home"
                        }
                    });
                }
            })
        }
    } catch (e) {
        console.log(e);
        writeLog('ERROR', `Something went wrong`, JSON.stringify(e));
        return res.status(500).json({
            message: "Something went wrong",
            body: e
        });
    }
}
