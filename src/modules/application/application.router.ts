import { Router } from "express";
import * as applicationController from "./application.controller";

const router = Router();
router.post("/", applicationController.applyToMatch);

export default router;
