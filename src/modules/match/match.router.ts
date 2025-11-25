import { Router } from "express";
import * as matchController from "./match.controller";

const router = Router();
router.post("/", matchController.createMatch);
router.get("/clubs", matchController.getMatchClubs);
router.get("/", matchController.getMatches);
router.get("/created", matchController.getCreatedMatches);
router.get("/played", matchController.getPlayedMatches);
router.get("/applied", matchController.getAppliedMatches);
router.get("/mine", matchController.getMyMatches);
router.get("/results", matchController.getMyPendingResults);
router.get("/count", matchController.getPlayedMatchesCount);
router.get("/details/:id", matchController.getMatchDetails);
router.post("/player", matchController.addPlayerToMatch);
router.delete("/player", matchController.deletePlayerFromMatch);
router.delete("/:id", matchController.deleteMatch);
router.put("/results", matchController.updateResult);
router.post("/results", matchController.acceptResult);
router.post("/matchwithresult", matchController.createMatchWithResult);
router.put("/:id", matchController.updateMatch);

export default router;
