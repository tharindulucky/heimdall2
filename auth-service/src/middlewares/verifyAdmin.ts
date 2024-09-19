import {RequestHandler} from "express";
import jwt from "jsonwebtoken";
import configs from "../configs";
import {IJWTDecodedData, IUser} from "../interfaces/types";
import {User} from "../models/User";
import {writeLog} from "../utils/logger";

export const verifyAdmin: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(authHeader) {
        const headers = authHeader.split(' ');
        const token = headers.length > 1 ? headers[1] : headers[0];
        if (!token)
            return res.status(401).json({message: "Unauthorized!"});

        jwt.verify(token, configs.jwt_secret, async (error, decoded: IJWTDecodedData) => {
            if(error) return res.status(401).json({message: "Unauthorized!"});

            if(decoded && decoded.authUserType == "admin") {
                next();
            }else{
                return res.status(401).json({message: "Invalid token!"});
            }
        });
    }else{
        return res.status(401).json({
            message: "Unauthorized!"
        });
    }
}