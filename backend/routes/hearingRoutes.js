const express = require("express");
const {
  createHearing,
  deleteHearing,
  getHearings,
  updateHearing,
} = require("../controllers/hearingController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getHearings).post(protect, createHearing);
router.route("/:id").put(protect, updateHearing).delete(protect, authorize("Admin"), deleteHearing);

module.exports = router;
