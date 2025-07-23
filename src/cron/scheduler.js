import cron from "node-cron";
import Campaign from "../models/campaign.js";
import List from "../models/list.js";
// import Contact from "../models/contact.js";
import { sendCampaignUtility } from "../utils/sendcampain.js";

cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking for scheduled campaigns...");
  const now = new Date();

  const campaigns = await Campaign.find({
    status: "Scheduled",
    scheduleDate: { $lte: now },
  });

  for (const campaign of campaigns) {
    try {
      let contactList = [];

      // Load contacts from list if campaign uses listContacts
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

      // Add manualEmails if present
      if (campaign.manualEmails && campaign.manualEmails.length > 0) {
        const manualContacts = campaign.manualEmails.map((email) => ({
          email,
          firstName: "",
          lastName: "",
        }));
        contactList = [...contactList, ...manualContacts];
      }

      // Pass full contactList to utility
      const result = await sendCampaignUtility(campaign, contactList);

      if (result.success) {
        campaign.status = "Sent";
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
