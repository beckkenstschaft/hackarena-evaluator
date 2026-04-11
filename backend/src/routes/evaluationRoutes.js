import express from 'express';
import Joi from 'joi';
import { protect, isJudgeOrAdmin } from '../middleware/authMiddleware.js';
import * as evaluationController from '../controllers/evaluationController.js';

const router = express.Router();

const validateEvaluation = (req, res, next) => {
  const schema = Joi.object({
    teamId: Joi.string().required(),
    roundId: Joi.string().required(),
    scores: Joi.object({
      innovation: Joi.number().min(0).max(10).required(),
      technical: Joi.number().min(0).max(10).required(),
      uiux: Joi.number().min(0).max(10).required(),
      presentation: Joi.number().min(0).max(10).required()
    }).required(),
    comments: Joi.string().max(1000),
    strengths: Joi.string().max(500),
    improvements: Joi.string().max(500),
    recommendation: Joi.string().valid('qualify', 'waitlist', 'reject')
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

router.post('/', protect, isJudgeOrAdmin, validateEvaluation, evaluationController.submitEvaluation);
router.get('/', protect, evaluationController.getEvaluations);
router.get('/judge', protect, isJudgeOrAdmin, evaluationController.getJudgeEvaluations);
router.get('/:id', protect, evaluationController.getEvaluation);
router.put('/:id', protect, evaluationController.updateEvaluation);
router.delete('/:id', protect, evaluationController.deleteEvaluation);

export default router;