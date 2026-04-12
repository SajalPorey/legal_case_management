const cron = require("node-cron");
const Case = require("../models/Case");
const Hearing = require("../models/Hearing");
const { sendEmail } = require("../utils/emailService");

const startReminders = () => {
  // Option for local testing: '*/1 * * * *' (Every minute)
  // For production: '0 8 * * *' (Every day at 8:00 AM)
  cron.schedule("0 8 * * *", async () => {
    console.log("Running hearing reminder job...");

    try {
      const now = new Date();
      // Look for hearings between now and 48 hours from now
      const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const upcomingHearings = await Hearing.find({
        hearingDate: { $gte: now, $lte: next48Hours },
        reminderSent: false,
      }).populate({
        path: "caseId",
        populate: [
          { path: "clientId", select: "name contactInfo" },
          { path: "assignedLawyer", select: "name email" },
        ],
      });

      console.log(`Found ${upcomingHearings.length} upcoming hearings requiring reminders.`);

      for (const hearing of upcomingHearings) {
        const legalCase = hearing.caseId;
        const lawyer = legalCase.assignedLawyer;
        const client = legalCase.clientId;

        const hearingDateFormatted = new Date(hearing.hearingDate).toLocaleString();

        const emailSubject = `Reminder: Upcoming Hearing for Case - ${legalCase.title}`;
        
        const emailHTML = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">Hearing Reminder</h2>
            <p>This is a reminder that you have an upcoming hearing.</p>
            <table style="width: 100%; max-width: 600px; border-collapse: collapse;">
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Case Title:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${legalCase.title}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Hearing Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${hearingDateFormatted}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Client:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${client.name}</td></tr>
            </table>
            <br>
            <p>Please ensure you are prepared. Log in to the portal for more details.</p>
          </div>
        `;

        const emailsToNotify = [];
        if (lawyer && lawyer.email) emailsToNotify.push(lawyer.email);
        if (client && client.contactInfo && client.contactInfo.email) emailsToNotify.push(client.contactInfo.email);

        if (emailsToNotify.length > 0) {
          // Send to all relevant parties
          await sendEmail(emailsToNotify, emailSubject, "You have an upcoming hearing.", emailHTML);

          // Mark as sent
          hearing.reminderSent = true;
          await hearing.save();
          console.log(`Reminder marked as sent for hearing ID: ${hearing._id}`);
        } else {
          console.log(`No valid email addresses found for hearing ID: ${hearing._id}`);
        }
      }
    } catch (error) {
      console.error("Error in reminder job:", error);
    }
  });

  console.log("Hearing reminder cron job scheduled.");
};

module.exports = {
  startReminders,
};
