const express = require("express");
const {
  createClient,
  deleteClient,
  getClientById,
  getClients,
  updateClient,
} = require("../controllers/clientController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getClients).post(protect, createClient);
router.route("/:id").get(protect, getClientById).put(protect, updateClient).delete(protect, authorize("Admin"), deleteClient);

module.exports = router;
