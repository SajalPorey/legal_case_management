require("dotenv").config();
const bcrypt = require("bcrypt");
const connectDB = require("../config/db");
const User = require("../models/User");
const Client = require("../models/Client");
const Case = require("../models/Case");
const Document = require("../models/Document");
const Hearing = require("../models/Hearing");
const Timeline = require("../models/Timeline");

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Client.deleteMany(),
      Case.deleteMany(),
      Document.deleteMany(),
      Hearing.deleteMany(),
      Timeline.deleteMany(),
    ]);

    const password = await bcrypt.hash("Password@123", 10);

    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@legalcms.com",
        password,
        role: "Admin",
      },
      {
        name: "Ava Counsel",
        email: "lawyer@legalcms.com",
        password,
        role: "Lawyer",
      },
    ]);

    const clients = await Client.insertMany([
      {
        name: "John Carter",
        contactInfo: { email: "john@example.com", phone: "555-1200" },
        address: "17 Oak Street, New Delhi",
        notes: "Corporate compliance client",
      },
      {
        name: "Meera Sharma",
        contactInfo: { email: "meera@example.com", phone: "555-9088" },
        address: "44 Green Avenue, Mumbai",
        notes: "Family law matters",
      },
    ]);

    const cases = await Case.insertMany([
      {
        clientId: clients[0]._id,
        title: "Acquisition Compliance Review",
        type: "Corporate",
        description: "Reviewing compliance exposure in a cross-border acquisition.",
        status: "In Progress",
        assignedLawyer: users[1]._id,
      },
      {
        clientId: clients[1]._id,
        title: "Custody Hearing Preparation",
        type: "Family",
        description: "Preparing affidavits and evidence packets for the next hearing.",
        status: "Hearing Scheduled",
        assignedLawyer: users[1]._id,
      },
    ]);

    const hearing = await Hearing.create({
      caseId: cases[1]._id,
      hearingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: "Bring medical and school records",
      location: "Family Court - Hall 2",
    });

    await Case.findByIdAndUpdate(cases[1]._id, {
      nextHearingDate: hearing.hearingDate,
    });

    await Timeline.insertMany([
      {
        caseId: cases[0]._id,
        activity: "Case imported from prior matter system",
        createdBy: users[0]._id,
      },
      {
        caseId: cases[1]._id,
        activity: "Hearing scheduled and client notified",
        createdBy: users[1]._id,
      },
    ]);

    console.log("Seed data created");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
