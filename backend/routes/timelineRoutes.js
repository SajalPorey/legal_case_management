const express = require("express");
const { addTimelineEntry, getTimelineByCase } = require("../controllers/timelineController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:caseId", protect, getTimelineByCase);
router.post("/", protect, addTimelineEntry);

module.exports = router;
