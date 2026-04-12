const Timeline = require("../models/Timeline");

const createTimelineEntry = async ({ caseId, activity, userId, timestamp }) => {
  if (!caseId || !activity) {
    return null;
  }

  return Timeline.create({
    caseId,
    activity,
    createdBy: userId,
    timestamp: timestamp || new Date(),
  });
};

module.exports = {
  createTimelineEntry,
};
