const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { protect, authorize } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimit');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pitch-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  }
});

// All routes require authentication
router.use(protect);

// Founder routes
router.post('/', authorize('founder'), ideaController.saveIdea);
router.put('/:id', authorize('founder'), ideaController.saveIdea);
router.post('/:id/submit', authorize('founder'), ideaController.submitIdea);
router.get('/my', authorize('founder'), ideaController.getMyIdeas);
router.delete('/:id', authorize('founder'), ideaController.deleteIdea);
router.post('/:id/upload', 
  authorize('founder'), 
  uploadLimiter, 
  upload.single('pitchDeck'), 
  ideaController.uploadPitchDeck
);

// Shared routes (founder, evaluator, admin)
router.get('/:id', ideaController.getIdeaById);

module.exports = router;