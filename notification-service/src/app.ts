import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import {emailServiceConsumer} from "./utils/consumer";

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

(async () => {
    await emailServiceConsumer();
})();

export default app;
