import cron from "node-cron";
import Campaign from "../models/campaign.js";
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
      const result = await sendCampaignUtility(campaign);
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
