import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.loginWithGoogle);
router.post("/refresh", authController.refreshToken);
router.post("/change-password", authenticate as any, authController.changePassword);

export default router;
