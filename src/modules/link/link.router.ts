import { Router } from "express";
import { redirectToMatchLink } from "./link.controller";

const router = Router();

router.get("/match/:id", redirectToMatchLink);

export default router;
