// cron.js
import cron from "node-cron";
import Campaign from "../models/campaign.js";
import List from "../models/list.js";
import Project from "../models/project.js"; // ✅ Don't forget to import Project
import { sendCampaignUtility } from "../utils/sendcampain.js";

cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking for scheduled campaigns...");

  const now = new Date();

  const campaigns = await Campaign.findOneAndUpdate(
  {
    scheduleDate: { $lte: new Date() },
    hasBeenSent: false,
  },
  {
    $set: { hasBeenSent: true },
  },
  { new: true }
);




  for (const campaign of campaigns) {
    try {
      let contactList = [];

      // 📋 Load contacts from list
      if (campaign.listContacts && campaign.listContacts.length > 0) {
        const list = await List.findById(campaign.listContacts).populate("contacts");
        if (list && list.contacts) {
          contactList = list.contacts.map((c) => ({
            email: c.email,
            firstName: c.firstName || "",
            lastName: c.lastName || "",
          }));
        }
      }

      // 📬 Add manual emails
      if (campaign.manualEmails && campaign.manualEmails.length > 0) {
        const manualContacts = campaign.manualEmails.map((email) => ({
          email,
          firstName: "",
          lastName: "",
        }));
        contactList = [...contactList, ...manualContacts];
      }

      // 🔐 Fetch Project for API key and fromEmail
      const project = await Project.findById(campaign.projectId);
      if (!project) {
        console.error(`❌ Project not found for campaign: ${campaign._id}`);
        continue;
      }

      if (campaign.hasBeenSent) {
        console.warn(`⚠️ Campaign ${campaign._id} already marked sent, skipping.`);
        continue;
      }

      const result = await sendCampaignUtility({
        ...campaign.toObject(),
        contacts: contactList,
        sendgridKey: project.apiKey,
        fromEmail: project.fromEmail,
      });

      if (result.success) {
        // ✅ Mark campaign as sent
        campaign.status = "Sent";
        campaign.hasBeenSent = true; 
        await campaign.save();
        console.log(`✅ Sent scheduled campaign: ${campaign.campaignName} (${result.emailsSent} emails)`);
      } else {
        console.error(`❌ Failed to send scheduled campaign: ${campaign.campaignName} - ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Crash sending campaign: ${campaign._id}`, error);
    }
  }
});
