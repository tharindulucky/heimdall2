import {Types, Document} from "mongoose";

export interface IUser extends Document{
    _id: Types.ObjectId;
    email: string;
    password: string;
    name: string;
    refreshToken: string;
    userType: string;
    status: string;
    mobileVerificationOTP: number | null;
    emailVerificationHash: string | null;
    emailVerificationCode: number | null;
    passwordResetHash: string | null;
    passwordResetCode: number | null;
    emailVerified: boolean;
    nextAction: string;
    count? : any
}

export interface IEmailPayload {
    toAddress: string;
    toName: string;
    subject?: string | null | undefined;
    data: any;
}

export interface IJWTDecodedData {
    authUserId: string;
    authUserType: string;
}

export interface IUserFilter {
    userType?: string | any;
    createdAt?: string | any;
    name?: string | any;
}