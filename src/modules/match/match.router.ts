import { Router } from "express";
import * as matchController from "./match.controller";

const router = Router();
router.post("/", matchController.createMatch);
router.get("/open", matchController.getOpenMatches);
router.get("/me", matchController.getMyMatches);
router.get("/count", matchController.getPlayedMatchesCount);
router.get("/details/:id", matchController.getMatchDetails);
router.post("/player", matchController.addPlayerToMatch);
router.delete("/player", matchController.deletePlayerFromMatch);
router.delete("/:id", matchController.deleteMatch);
router.put("/:id", matchController.updateMatch);

export default router;
