const Case = require("../models/Case");
const Client = require("../models/Client");
const Document = require("../models/Document");
const Hearing = require("../models/Hearing");

const getDashboardSummary = async (req, res, next) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    let caseMatch = {};
    let clientMatch = {};
    let hearingMatch = {
      hearingDate: { $gte: today, $lte: nextWeek },
    };
    let documentMatch = {};

    if (req.user.role === "Lawyer") {
      caseMatch.assignedLawyer = req.user._id;

      const caseIds = await Case.distinct("_id", caseMatch);
      const clientIdsFromCases = await Case.distinct("clientId", caseMatch);

      clientMatch = { $or: [{ createdBy: req.user._id }, { _id: { $in: clientIdsFromCases } }] };
      hearingMatch.caseId = { $in: caseIds };
      documentMatch.caseId = { $in: caseIds };
    }

    const [caseCounts, totalClients, totalDocuments, upcomingHearings, recentCases] = await Promise.all([
      Case.aggregate([
        { $match: caseMatch },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Client.countDocuments(clientMatch),
      Document.countDocuments(documentMatch),
      Hearing.find(hearingMatch)
        .populate({
          path: "caseId",
          select: "title clientId",
          populate: { path: "clientId", select: "name" },
        })
        .sort({ hearingDate: 1 }),
      Case.find(caseMatch)
        .populate("clientId", "name")
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

    const statusSummary = caseCounts.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      { Open: 0, "In Progress": 0, "Hearing Scheduled": 0, Closed: 0 }
    );

    res.json({
      counts: {
        totalCases:
          statusSummary.Open +
          statusSummary["In Progress"] +
          statusSummary["Hearing Scheduled"] +
          statusSummary.Closed,
        totalClients,
        totalDocuments,
        upcomingHearings: upcomingHearings.length,
        ...statusSummary,
      },
      upcomingHearings,
      recentCases,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
