const User = require("../models/User");
const AdminRequest = require("../models/AdminRequest");

// Get all pending admin requests (Admin only)
const getAdminRequests = async (req, res, next) => {
  try {
    const requests = await AdminRequest.find({ status: "pending" })
      .populate("userId", "name email createdAt")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// Approve a request → promote user to Admin
const approveAdminRequest = async (req, res, next) => {
  try {
    const request = await AdminRequest.findById(req.params.id).populate("userId");

    if (!request) {
      res.status(404);
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      res.status(400);
      throw new Error("This request has already been processed");
    }

    // Promote user to Admin
    await User.findByIdAndUpdate(request.userId._id, { role: "Admin" });

    request.status = "approved";
    await request.save();

    res.json({ message: `${request.userId.name} has been promoted to Admin` });
  } catch (error) {
    next(error);
  }
};

// Reject a request
const rejectAdminRequest = async (req, res, next) => {
  try {
    const request = await AdminRequest.findById(req.params.id);

    if (!request) {
      res.status(404);
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      res.status(400);
      throw new Error("This request has already been processed");
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
};
