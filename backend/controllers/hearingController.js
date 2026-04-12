const Case = require("../models/Case");
const Hearing = require("../models/Hearing");
const { createTimelineEntry } = require("./timelineHelpers");

const getHearings = async (req, res, next) => {
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

    const hearings = await Hearing.find(query)
      .populate({
        path: "caseId",
        select: "title status clientId",
        populate: {
          path: "clientId",
          select: "name",
        },
      })
      .sort({ hearingDate: 1 });

    res.json(hearings);
  } catch (error) {
    next(error);
  }
};

const createHearing = async (req, res, next) => {
  try {
    const { caseId, hearingDate, notes, location } = req.body;

    if (!caseId || !hearingDate) {
      res.status(400);
      throw new Error("Case and hearing date are required");
    }

    const legalCase = await Case.findById(caseId);

    if (!legalCase) {
      res.status(404);
      throw new Error("Case not found");
    }

    if (req.user.role === "Lawyer" && legalCase.assignedLawyer?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to schedule hearings for this case");
    }

    const hearing = await Hearing.create({
      caseId,
      hearingDate,
      notes,
      location,
    });

    legalCase.status = "Hearing Scheduled";
    legalCase.nextHearingDate = hearingDate;
    await legalCase.save();

    await createTimelineEntry({
      caseId,
      activity: `Hearing scheduled for ${new Date(hearingDate).toLocaleString()}`,
      userId: req.user._id,
    });

    res.status(201).json(hearing);
  } catch (error) {
    next(error);
  }
};

const updateHearing = async (req, res, next) => {
  try {
    const hearing = await Hearing.findById(req.params.id);

    if (!hearing) {
      res.status(404);
      throw new Error("Hearing not found");
    }

    if (req.user.role === "Lawyer") {
      const ownsCase = await Case.exists({ _id: hearing.caseId, assignedLawyer: req.user._id });
      if (!ownsCase) {
        res.status(403);
        throw new Error("Not authorized to update this hearing");
      }
    }

    hearing.hearingDate = req.body.hearingDate || hearing.hearingDate;
    hearing.notes = req.body.notes ?? hearing.notes;
    hearing.location = req.body.location ?? hearing.location;
    hearing.reminderSent = req.body.reminderSent ?? hearing.reminderSent;

    const updatedHearing = await hearing.save();

    await Case.findByIdAndUpdate(hearing.caseId, {
      nextHearingDate: updatedHearing.hearingDate,
      status: "Hearing Scheduled",
    });

    await createTimelineEntry({
      caseId: hearing.caseId,
      activity: `Hearing updated to ${new Date(updatedHearing.hearingDate).toLocaleString()}`,
      userId: req.user._id,
    });

    res.json(updatedHearing);
  } catch (error) {
    next(error);
  }
};

const deleteHearing = async (req, res, next) => {
  try {
    const hearing = await Hearing.findById(req.params.id);

    if (!hearing) {
      res.status(404);
      throw new Error("Hearing not found");
    }

    const caseId = hearing.caseId;
    await hearing.deleteOne();

    const nextHearing = await Hearing.findOne({ caseId }).sort({ hearingDate: 1 });
    await Case.findByIdAndUpdate(caseId, {
      nextHearingDate: nextHearing ? nextHearing.hearingDate : null,
      status: nextHearing ? "Hearing Scheduled" : "In Progress",
    });

    await createTimelineEntry({
      caseId,
      activity: "Hearing removed",
      userId: req.user._id,
    });

    res.json({ message: "Hearing deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHearings,
  createHearing,
  updateHearing,
  deleteHearing,
};
