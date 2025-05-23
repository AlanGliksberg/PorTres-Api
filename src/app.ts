import express, { RequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./modules/auth/auth.router";
import matchRouter from "./modules/match/match.router";
import playerRouter from "./modules/player/player.router";
import applicationRouter from "./modules/application/application.router";
import { authenticate } from "./middlewares/auth.middleware";
import { requestLogger } from "./middlewares/logger";

dotenv.config();
const app = express();
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:8081"],
  methods: ["GET", "POST", "PUT", "DELETE"]
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(requestLogger);
app.use("/api/auth", authRouter);

app.use(authenticate as RequestHandler);

app.use("/api/matches", matchRouter);
app.use("/api/player", playerRouter);
app.use("/api/application", applicationRouter);

export default app;
