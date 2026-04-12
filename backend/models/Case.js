const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Hearing Scheduled", "Closed"],
      default: "Open",
    },
    assignedLawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    nextHearingDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
