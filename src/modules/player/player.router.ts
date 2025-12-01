import { Router } from "express";
import multer from "multer";
import * as playerController from "./player.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.any(), playerController.createPlayer);
router.post("/update-picture", upload.single("profilePhoto"), playerController.updatePlayerPhoto);
router.delete("/picture", playerController.deletePlayerPhoto);
router.put("/", playerController.updatePlayer);
router.post("/push-token", playerController.saveExpoPushToken);
router.get("/details/:id", playerController.getPlayerDetails);
router.delete("/", playerController.deleteCurrentUser);
router.get("/", playerController.getPlayers);
router.get("/gender", playerController.getGenders);
router.get("/position", playerController.getPositions);
router.get("/category", playerController.getCategories);
router.get("/question", playerController.getQuestions);

export default router;
