const Timeline = require("../models/Timeline");
const Case = require("../models/Case");
const { createTimelineEntry } = require("./timelineHelpers");

const getTimelineByCase = async (req, res, next) => {
  try {
    const entries = await Timeline.find({ caseId: req.params.caseId })
      .populate("createdBy", "name role")
      .sort({ timestamp: -1 });

    res.json(entries);
  } catch (error) {
    next(error);
  }
};

const addTimelineEntry = async (req, res, next) => {
  try {
    const { caseId, activity } = req.body;

    if (!caseId || !activity) {
      res.status(400);
      throw new Error("Case ID and activity are required");
    }

    const legalCase = await Case.findById(caseId);

    if (!legalCase) {
      res.status(404);
      throw new Error("Case not found");
    }

    const entry = await createTimelineEntry({
      caseId,
      activity,
      userId: req.user._id,
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimelineByCase,
  addTimelineEntry,
};
