import { Router } from "express";
import * as matchController from "./match.controller";

const router = Router();
router.post("/", matchController.createMatch);
router.get("/open", matchController.getOpenMatches);
router.get("/me", matchController.getMyMatches);
router.get("/details/:id", matchController.getMatchDetails);
router.put("/:id", matchController.updateMatch);
router.delete("/:id", matchController.deleteMatch);
router.post("/player", matchController.addPlayerToMatch);

export default router;
