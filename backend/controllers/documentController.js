const fs = require("fs");
const path = require("path");
const Case = require("../models/Case");
const Document = require("../models/Document");
const { createTimelineEntry } = require("./timelineHelpers");

const getDocuments = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.caseId) {
      query.caseId = req.query.caseId;
    }

    if (req.user.role === "Lawyer") {
      const caseIds = await Case.distinct("_id", { assignedLawyer: req.user._id });
      if (query.caseId) {
        if (!caseIds.some((id) => id.toString() === query.caseId)) {
          return res.json([]);
        }
      } else {
        query.caseId = { $in: caseIds };
      }
    }

    const documents = await Document.find(query)
      .populate("caseId", "title")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const { caseId } = req.body;

    if (!caseId) {
      res.status(400);
      throw new Error("Case ID is required");
    }

    if (!req.file) {
      res.status(400);
      throw new Error("A file upload is required");
    }

    const legalCase = await Case.findById(caseId);

    if (!legalCase) {
      fs.unlinkSync(req.file.path);
      res.status(404);
      throw new Error("Case not found");
    }

    if (req.user.role === "Lawyer" && legalCase.assignedLawyer?.toString() !== req.user._id.toString()) {
      fs.unlinkSync(req.file.path);
      res.status(403);
      throw new Error("Not authorized to upload to this case");
    }

    const document = await Document.create({
      caseId,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
    });

    await createTimelineEntry({
      caseId,
      activity: `Document uploaded: ${req.file.originalname}`,
      userId: req.user._id,
    });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      res.status(404);
      throw new Error("Document not found");
    }

    const filePath = path.join(__dirname, "..", "uploads", path.basename(document.fileUrl));

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();

    await createTimelineEntry({
      caseId: document.caseId,
      activity: `Document removed: ${document.fileName}`,
      userId: req.user._id,
    });

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument,
};
