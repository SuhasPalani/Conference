// FILE: backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/roles', adminController.updateUserRoles);
router.delete('/users/:id', adminController.deleteUser);

// Idea management
router.get('/ideas', adminController.getAllIdeas);
router.put('/ideas/:id/status', adminController.updateIdeaStatus);
router.post('/ideas/:id/assign', adminController.assignEvaluators);

// Evaluator workload
router.get('/evaluators/workload', adminController.getEvaluatorWorkload);

// Dashboard & Analytics
router.get('/dashboard', adminController.getDashboardStats);

// Data export
router.get('/export/ideas', adminController.exportIdeas);
router.get('/export/evaluations', adminController.exportEvaluations);

module.exports = router;