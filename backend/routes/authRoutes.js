const express = require("express");
const { getProfile, login, register, getAllUsers } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.get("/", protect, authorize("Admin"), getAllUsers);

module.exports = router;
