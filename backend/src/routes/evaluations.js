const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Evaluator routes
router.get('/assigned', authorize('evaluator'), evaluationController.getAssignedIdeas);
router.post('/', authorize('evaluator'), evaluationController.submitEvaluation);
router.put('/:id', authorize('evaluator'), evaluationController.updateEvaluation);
router.get('/:id', evaluationController.getEvaluationById);

// Admin/Founder routes
router.get('/idea/:ideaId', evaluationController.getIdeaEvaluations);

module.exports = router;