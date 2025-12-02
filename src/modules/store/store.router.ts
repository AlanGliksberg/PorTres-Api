import { Router } from "express";
import * as storeController from "./store.controller";

const router = Router();

router.get("/download", storeController.redirectToStore);

export default router;
