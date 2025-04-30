import { Router } from 'express';
import * as matchController from './match.controller';

const router = Router();
router.post('/', matchController.createMatch);
router.get('/open', matchController.getOpenMatches);

export default router;
