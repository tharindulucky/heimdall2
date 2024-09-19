import express from "express";
import {
    resetPassword,
    sendEmailVerification,
    sendResetPasswordEmail,
    signIn,
    signUp,
    authenticate,
    verifyEmail, changePassword
} from "../controllers/AuthController";
import {accountCreationLimiter, emailLimiter} from "../utils/rateLimiter";
import {getUsers} from "../controllers/UserController";
import {verifyToken} from "../middlewares/verifyToken";
import {verifyAdmin} from "../middlewares/verifyAdmin";

const authRoutes = express.Router();

authRoutes.post("/signup", accountCreationLimiter, signUp);
authRoutes.post("/signin", signIn);
authRoutes.post("/send-email-verification", emailLimiter, sendEmailVerification);
authRoutes.patch("/verify-email", verifyEmail);
authRoutes.post("/send-password-reset-email", emailLimiter, sendResetPasswordEmail);
authRoutes.post("/reset-password", resetPassword);
authRoutes.patch("/change-password", emailLimiter, verifyToken, changePassword);
authRoutes.post("/authenticate", authenticate);

export default authRoutes;