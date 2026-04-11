import express from 'express';
import Joi from 'joi';
import { protect, isJudgeOrAdmin } from '../middleware/authMiddleware.js';
import * as teamController from '../controllers/teamController.js';

const router = express.Router();

const validateTeam = (req, res, next) => {
  const schema = Joi.object({
    hackathonId: Joi.string().required(),
    teamName: Joi.string().max(50).required(),
    projectTitle: Joi.string().max(100).required(),
    description: Joi.string().max(1000),
    track: Joi.string().required(),
    members: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        role: Joi.string(),
        email: Joi.string().email()
      })
    ),
    contactEmail: Joi.string().email(),
    prototypeLink: Joi.string().uri(),
    repositoryLink: Joi.string().uri()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

router.post('/', protect, validateTeam, teamController.registerTeam);
router.get('/', protect, teamController.getTeams);
router.get('/my', protect, teamController.getMyTeams);
router.get('/qrid/:qrId', protect, teamController.getTeamByQRId);
router.get('/:id', protect, teamController.getTeam);
router.get('/:id/qrcode', protect, teamController.getTeamQRCode);
router.put('/:id', protect, teamController.updateTeam);
router.delete('/:id', protect, teamController.deleteTeam);

export default router;