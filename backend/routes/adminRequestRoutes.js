const express = require("express");
const {
  getAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
} = require("../controllers/adminRequestController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes - Admin only
router.get("/", protect, authorize("Admin"), getAdminRequests);
router.patch("/:id/approve", protect, authorize("Admin"), approveAdminRequest);
router.patch("/:id/reject", protect, authorize("Admin"), rejectAdminRequest);

module.exports = router;
