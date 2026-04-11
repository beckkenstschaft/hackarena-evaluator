import express from 'express';
import Joi from 'joi';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import * as hackathonController from '../controllers/hackathonController.js';

const router = express.Router();

router.get('/rounds', protect, hackathonController.getRounds);

router.use(protect, isAdmin);

const validateHackathon = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(2000),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    tracks: Joi.array().items(Joi.string()),
    rules: Joi.string().max(5000),
    prizes: Joi.array().items(
      Joi.object({
        place: Joi.number(),
        title: Joi.string(),
        amount: Joi.number(),
        description: Joi.string()
      })
    ),
    coverImage: Joi.string()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

const validateRound = (req, res, next) => {
  const schema = Joi.object({
    hackathonId: Joi.string().required(),
    name: Joi.string().max(50).required(),
    description: Joi.string().max(500),
    order: Joi.number(),
    qualificationThreshold: Joi.number().min(0).max(100),
    startDate: Joi.date(),
    endDate: Joi.date(),
    judgingCriteria: Joi.object({
      innovation: Joi.number(),
      technical: Joi.number(),
      uiux: Joi.number(),
      presentation: Joi.number()
    })
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

router.post('/hackathons', validateHackathon, hackathonController.createHackathon);
router.get('/hackathons', hackathonController.getHackathons);
router.get('/hackathons/:id', hackathonController.getHackathon);
router.put('/hackathons/:id', hackathonController.updateHackathon);
router.delete('/hackathons/:id', hackathonController.deleteHackathon);

router.post('/rounds', validateRound, hackathonController.createRound);
router.get('/rounds', hackathonController.getRounds);
router.get('/rounds/:id', hackathonController.getRound);
router.put('/rounds/:id', hackathonController.updateRound);

router.get('/analytics', hackathonController.getAnalytics);
router.get('/judge-performance', hackathonController.getJudgePerformance);
router.get('/export', hackathonController.exportData);

export default router;