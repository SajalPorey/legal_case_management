const fs = require("fs");
const path = require("path");
const Case = require("../models/Case");
const Client = require("../models/Client");
const Document = require("../models/Document");
const Hearing = require("../models/Hearing");
const Timeline = require("../models/Timeline");
const { createTimelineEntry } = require("./timelineHelpers");

const buildSearchQuery = (query, user) => {
  const filters = {};

  if (user && user.role === "Lawyer") {
    filters.assignedLawyer = user._id;
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.clientId) {
    filters.clientId = query.clientId;
  }

  if (query.keyword) {
    filters.$or = [
      { title: { $regex: query.keyword, $options: "i" } },
      { type: { $regex: query.keyword, $options: "i" } },
      { description: { $regex: query.keyword, $options: "i" } },
    ];
  }

  return filters;
};

const getCases = async (req, res, next) => {
  try {
    const cases = await Case.find(buildSearchQuery(req.query, req.user))
      .populate("clientId", "name contactInfo")
      .populate("assignedLawyer", "name email")
      .sort({ updatedAt: -1 });

    res.json(cases);
  } catch (error) {
    next(error);
  }
};

const getCaseById = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id)
      .populate("clientId")
      .populate("assignedLawyer", "name email role");

    if (!legalCase) {
      res.status(404);
      throw new Error("Case not found");
    }

    if (req.user.role === "Lawyer" && legalCase.assignedLawyer?.role !== "Lawyer" && legalCase.assignedLawyer?._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view this case");
    }

    const [documents, hearings, timeline] = await Promise.all([
      Document.find({ caseId: legalCase._id }).sort({ createdAt: -1 }),
      Hearing.find({ caseId: legalCase._id }).sort({ hearingDate: 1 }),
      Timeline.find({ caseId: legalCase._id }).sort({ timestamp: -1 }),
    ]);

    res.json({
      ...legalCase.toObject(),
      documents,
      hearings,
      timeline,
    });
  } catch (error) {
    next(error);
  }
};

const createCase = async (req, res, next) => {
  try {
    const { clientId, title, type, description, status, assignedLawyer } = req.body;

    if (!clientId || !title || !type) {
      res.status(400);
      throw new Error("Client, title, and type are required");
    }

    const clientExists = await Client.findById(clientId);

    if (!clientExists) {
      res.status(404);
      throw new Error("Client not found");
    }

    const resolvedLawyer = req.user.role === "Lawyer" ? req.user._id : assignedLawyer;

    const legalCase = await Case.create({
      clientId,
      title,
      type,
      description,
      status: status || "Open",
      assignedLawyer: resolvedLawyer,
    });

    await createTimelineEntry({
      caseId: legalCase._id,
      activity: `Case created with status "${legalCase.status}"`,
      userId: req.user._id,
    });

    const populatedCase = await Case.findById(legalCase._id)
      .populate("clientId", "name contactInfo")
      .populate("assignedLawyer", "name email");

    res.status(201).json(populatedCase);
  } catch (error) {
    next(error);
  }
};

const updateCase = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id);

    if (!legalCase) {
      res.status(404);
      throw new Error("Case not found");
    }

    if (req.user.role === "Lawyer" && legalCase.assignedLawyer?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this case");
    }

    const previousStatus = legalCase.status;

    legalCase.clientId = req.body.clientId || legalCase.clientId;
    legalCase.title = req.body.title || legalCase.title;
    legalCase.type = req.body.type || legalCase.type;
    legalCase.description = req.body.description ?? legalCase.description;
    legalCase.status = req.body.status || legalCase.status;
    legalCase.assignedLawyer = req.user.role === "Admin" ? (req.body.assignedLawyer ?? legalCase.assignedLawyer) : legalCase.assignedLawyer;

    const updatedCase = await legalCase.save();

    await createTimelineEntry({
      caseId: updatedCase._id,
      activity:
        previousStatus !== updatedCase.status
          ? `Status updated from "${previousStatus}" to "${updatedCase.status}"`
          : "Case details updated",
      userId: req.user._id,
    });

    const populatedCase = await Case.findById(updatedCase._id)
      .populate("clientId", "name contactInfo")
      .populate("assignedLawyer", "name email");

    res.json(populatedCase);
  } catch (error) {
    next(error);
  }
};

const deleteCase = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id);

    if (!legalCase) {
      res.status(404);
      throw new Error("Case not found");
    }

    const documents = await Document.find({ caseId: req.params.id });

    documents.forEach((document) => {
      const filePath = path.join(__dirname, "..", "uploads", path.basename(document.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Promise.all([
      legalCase.deleteOne(),
      Document.deleteMany({ caseId: req.params.id }),
      Hearing.deleteMany({ caseId: req.params.id }),
      Timeline.deleteMany({ caseId: req.params.id }),
    ]);

    res.json({ message: "Case deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getCaseStats = async (req, res, next) => {
  try {
    let caseFilter = {};
    let hearingFilter = { hearingDate: { $gte: new Date() } };

    if (req.user.role === "Lawyer") {
      caseFilter.assignedLawyer = req.user._id;
      const userCaseIds = await Case.distinct("_id", { assignedLawyer: req.user._id });
      hearingFilter.caseId = { $in: userCaseIds };
    }

    const [totalCases, openCases, closedCases, upcomingHearings] = await Promise.all([
      Case.countDocuments(caseFilter),
      Case.countDocuments({ ...caseFilter, status: { $ne: "Closed" } }),
      Case.countDocuments({ ...caseFilter, status: "Closed" }),
      Hearing.countDocuments(hearingFilter),
    ]);

    res.json({
      totalCases,
      openCases,
      closedCases,
      upcomingHearings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getCaseStats,
};
