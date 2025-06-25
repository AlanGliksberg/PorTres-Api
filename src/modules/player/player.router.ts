import { Router } from "express";
import * as playerController from "./player.controller";

const router = Router();
router.post("/", playerController.createPlayer);
router.get("/", playerController.getPlayers);
router.get("/gender", playerController.getGenders);
router.get("/position", playerController.getPositions);
router.get("/category", playerController.getCategories);
router.get("/question", playerController.getQuestions);

export default router;
