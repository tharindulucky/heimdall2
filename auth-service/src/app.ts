import express from 'express';
import mongoose from "mongoose";
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares/general';
import configs from "./configs";
import authRoutes from "./routes/authRoutes";
import {writeLog} from "./utils/logger";
import {rateLimiter} from "./utils/rateLimiter";
import {createDefaultUser} from "./seeder";
import userRoutes from "./routes/userRoutes";

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth/", rateLimiter, authRoutes);
app.use("/api/v1/users/", rateLimiter, userRoutes);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const connectDB = async () => {
    try {
        await mongoose.connect(configs.db.uri);
        console.info('Connected to AuthDB');
        writeLog('INFO', 'Connected to AuthDB');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

(async () =>{
    await connectDB();
    await createDefaultUser();
})();
export default app;
