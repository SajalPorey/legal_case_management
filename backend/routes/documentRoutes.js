const express = require("express");
const {
  deleteDocument,
  getDocuments,
  uploadDocument,
} = require("../controllers/documentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.route("/").get(protect, getDocuments).post(protect, upload.single("file"), uploadDocument);
router.route("/:id").delete(protect, authorize("Admin"), deleteDocument);

module.exports = router;
