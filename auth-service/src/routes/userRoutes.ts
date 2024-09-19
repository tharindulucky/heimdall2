import express from "express";

import {getUser, getUserProfile, getUsers, updateUserProfile} from "../controllers/UserController";
import {verifyToken} from "../middlewares/verifyToken";
import {verifyAdmin} from "../middlewares/verifyAdmin";

const userRoutes = express.Router();

userRoutes.get('/', [verifyToken, verifyAdmin], getUsers);
userRoutes.get('/me', [verifyToken], getUserProfile);
userRoutes.get('/:id', [verifyToken, verifyAdmin], getUser);
userRoutes.patch('/me', [verifyToken], updateUserProfile);

export default userRoutes;