import { Router } from "express";
import * as playerController from "./player.controller";

const router = Router();
router.post("/", playerController.createplayer);
// router.get('/', playerController.getplayers);

export default router;
