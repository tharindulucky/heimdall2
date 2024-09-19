import mongoose from "mongoose";
import {IUser} from "../interfaces/types";

const  UserSchema = new mongoose.Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "pending"
    },
    refreshToken: {
        type: String,
        required: false,
        default: null
    },
    mobileVerificationOTP: {
        type: Number,
        required: false,
        default: null
    },
    emailVerificationHash: {
        type: String,
        required: false,
        default: null
    },
    emailVerificationCode: {
        type: Number,
        required: false,
        default: null
    },
    passwordResetHash: {
        type: String,
        required: false,
        default: null
    },
    passwordResetCode: {
        type: Number,
        required: false,
        default: null
    },
    emailVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    nextAction: {
        type: String,
        required: true,
        default: "verifyEmail"
    }
}, {toJSON: {getters: true}, timestamps: true})

export const User = mongoose.model('User', UserSchema)