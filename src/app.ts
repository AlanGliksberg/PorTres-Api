import express, { RequestHandler } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './modules/auth/auth.router';
import matchRouter from './modules/match/match.router';
import { authenticate } from './middlewares/auth.middleware';

dotenv.config();
const app = express();
const corsOptions = {
  origin: ['http://localhost:3000', 'https://twqmv4c3-3000.brs.devtunnels.ms'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/auth', authRouter);

app.use(authenticate as RequestHandler);

app.use('/api/matches', matchRouter);

export default app;