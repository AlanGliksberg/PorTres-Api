import { Router } from "express";
import * as notificationsController from "./notifications.controller";

const router = Router();

router.post("/push/broadcast", notificationsController.sendBroadcastPush);

export default router;
