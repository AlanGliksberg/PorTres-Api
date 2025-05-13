import { Router } from "express";
import * as applicationController from "./application.controller";

const router = Router();
router.post("/", applicationController.applyToMatch);
router.post("/accept/:id", applicationController.acceptApplication);

export default router;
