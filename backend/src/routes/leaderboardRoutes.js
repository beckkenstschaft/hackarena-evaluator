import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as leaderboardController from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/', protect, leaderboardController.getLeaderboard);
router.get('/position', protect, leaderboardController.getTeamLeaderboardPosition);
router.get('/live', leaderboardController.getLiveScores);

export default router;