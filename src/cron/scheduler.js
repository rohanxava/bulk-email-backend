import cron from "node-cron";
import Campaign from "../models/campaign.js";
import List from "../models/list.js";
import Papa from 'papaparse';
import Project from "../models/project.js";
import { sendCampaignUtility } from "../utils/sendcampain.js";

// ⏰ Run every minute
cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking for scheduled campaigns...");

  try {
    const now = new Date();
    const roundedNow = new Date(); // ⏰ Keep original date intact
    roundedNow.setSeconds(0, 0);   // Round down to nearest minute

    console.log("📅 Current UTC time:", now.toISOString());

    const scheduledCampaigns = await Campaign.find({
      status: "Scheduled",
      hasBeenSent: false,
      scheduleDate: { $lte: roundedNow },
    });

    console.log("📋 Scheduled campaigns to send:", scheduledCampaigns.length);

    for (const campaign of scheduledCampaigns) {
      console.log(`➡️ Processing campaign: ${campaign._id} | ${campaign.campaignName}`);

      try {
        let contactList = [];

        // 📂 Load contacts from saved list
        if (campaign.listContacts) {
          console.log("📂 Loading contacts from list ID:", campaign.listContacts);
          const list = await List.findById(campaign.listContacts).populate("contacts");

          if (list?.contacts?.length > 0) {
            contactList = list.contacts.map((c) => ({
              email: c.email,
              firstName: c.firstName || "",
              lastName: c.lastName || "",
            }));
            console.log(`📨 Loaded ${contactList.length} contacts from list`);
          } else {
            console.warn("⚠️ No contacts found in list or list not found");
          }
        }

        // 📄 Load contacts from CSV
        if (campaign.csvContent) {
          const parsedCSV = Papa.parse(campaign.csvContent, { header: true, skipEmptyLines: true }).data;

          const normalizeField = (row, keys) => {
            for (const key of keys) {
              const match = Object.keys(row).find(
                k => k.toLowerCase().replace(/\s/g, '') === key.toLowerCase().replace(/\s/g, '')
              );
              if (match) return row[match];
            }
            return "";
          };

          const csvContacts = parsedCSV
            .filter(c => normalizeField(c, ["email", "email address"]).includes("@"))
            .map(c => ({
              email: normalizeField(c, ["email", "email address"]),
              firstName: normalizeField(c, ["firstName", "firstname", "first name"]),
              lastName: normalizeField(c, ["lastName", "lastname", "last name"]),
            }));

            console.log("✅ csvContacts after normalization:", csvContacts);

          contactList.push(...csvContacts);
          console.log(`📄 Added ${csvContacts.length} contacts from CSV`);
        }

        // ➕ Add manually added emails
        if (Array.isArray(campaign.manualEmails) && campaign.manualEmails.length > 0) {
          const allEmails = campaign.manualEmails
            .flatMap((entry) => entry.split(",")) // split if stored as comma-separated
            .map((email) => email.trim())
            .filter(Boolean);

          const manualContacts = allEmails.map((email) => ({
            email,
            firstName: "",
            lastName: "",
          }));

          contactList.push(...manualContacts);
          console.log(`➕ Added ${manualContacts.length} manual contacts`);
        }

        if (contactList.length === 0) {
          console.warn(`⚠️ No recipients found for campaign '${campaign.campaignName}', skipping...`);
          continue;
        }

        // 🔍 Get related project info
        const project = await Project.findById(campaign.projectId);
        if (!project) {
          console.error(`❌ Project not found for campaign: ${campaign._id}`);
          continue;
        }

        // 📤 Send campaign using utility
        console.log("📨 Sending campaign via utility...");
        const result = await sendCampaignUtility({
          ...campaign.toObject(),
          contacts: contactList,
          sendgridKey: project.apiKey,
          fromEmail: project.fromEmail,
        });

        if (result.success) {
          campaign.status = "Sent";
          campaign.hasBeenSent = true;
          await campaign.save();
          console.log(`✅ Sent campaign '${campaign.campaignName}' (${result.emailsSent} emails)`);
        } else {
          console.error(`❌ Failed to send campaign '${campaign.campaignName}': ${result.error}`);
        }
      } catch (err) {
        console.error(`❌ Error while processing campaign ${campaign._id}:`, err);
      }
    }

    console.log("✅ Campaign processing complete.");
  } catch (cronError) {
    console.error("🚨 Cron job failed:", cronError);
  }
});
