const express = require("express");
const {
  createCase,
  deleteCase,
  getCaseById,
  getCases,
  getCaseStats,
  updateCase,
} = require("../controllers/caseController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", protect, getCaseStats);
router.route("/").get(protect, getCases).post(protect, createCase);
router.route("/:id").get(protect, getCaseById).put(protect, updateCase).delete(protect, authorize("Admin"), deleteCase);

module.exports = router;
