// FILE: backend/src/routes/roleRequests.js
const express = require("express");
const router = express.Router();
const roleRequestController = require("../controllers/roleRequestController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

router.post("/", roleRequestController.submitRoleRequest);
router.get("/my", roleRequestController.getMyRoleRequests);

module.exports = router;
