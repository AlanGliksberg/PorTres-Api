import { Router } from "express";
import * as storeController from "./store.controller";

const router = Router();

router.get("/download", storeController.redirectToStore);
router.get("/qr", storeController.redirectToQR);

export default router;
