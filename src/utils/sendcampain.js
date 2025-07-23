import sgMail from "@sendgrid/mail";
import Campaign from "../models/campaign.js";
import Papa from "papaparse";
import Project from "../models/project.js";

export const sendCampaignUtility = async (campaignDoc) => {
  try {
    const {
      subject,
      htmlContent,
      csvContent,
      manualEmails,
      fromEmail,
      campaignName,
      createdBy,
      projectId,
      templateId,
      scheduleDate,
      contacts = [],
    } = campaignDoc;

    // ✅ Fetch SendGrid key from the Project model
    const project = await Project.findById(projectId);

    if (!project) {
      console.error(`❌ Project not found for ID: ${projectId}`);
      return { error: `Project not found for ID: ${projectId}` };
    }

    if (!project.apiKey) {
      console.error(`❌ API key missing for project: ${project.name}`);
      return { error: `API key missing for project: ${project.name}` };
    }

    sgMail.setApiKey(project.apiKey);

    const csvContacts = csvContent
      ? Papa.parse(csvContent, { header: true, skipEmptyLines: true }).data
      : [];

    const manualContactObjects = Array.isArray(manualEmails)
      ? manualEmails.map((email) => ({ email }))
      : [];

    const allContacts = [...csvContacts, ...contacts, ...manualContactObjects];

    const uniqueContactsMap = {};
    allContacts.forEach((contact) => {
      const emailKey = Object.keys(contact).find(
        (key) => key.toLowerCase() === "email"
      );
      if (emailKey && contact[emailKey]) {
        uniqueContactsMap[contact[emailKey].toLowerCase()] = contact;
      }
    });

    const finalContacts = Object.values(uniqueContactsMap);
    const emails = finalContacts.map((c) => {
      const emailKey = Object.keys(c).find(
        (k) => k.toLowerCase() === "email"
      );
      return c[emailKey];
    });

    const BASE_URL = "https://bulkmail.xavawebservices.com";
    const trackingPixel = `<img src="${BASE_URL}/api/tracking/open/${campaignDoc._id}" width="1" height="1" style="display:none;" />`;

    const sendPromises = emails.map((email) => {
      const firstContact =
        finalContacts.find((c) => {
          const key = Object.keys(c).find(
            (k) => k.toLowerCase() === "email"
          );
          return key && c[key].toLowerCase() === email.toLowerCase();
        }) || {};

      const firstName = firstContact.firstName || "Valued";
      const lastName = firstContact.lastName || "Customer";

      let content = htmlContent
        .replace(/{{firstName}}/g, firstName)
        .replace(/{{lastName}}/g, lastName);

      content = content.replace(/href="([^"]+)"/g, (match, href) => {
        if (
          href.startsWith("#") ||
          href.includes("/api/tracking/click")
        )
          return match;

        const trackingUrl = `${BASE_URL}/api/tracking/click/${campaignDoc._id}?redirect=${encodeURIComponent(
          href
        )}`;
        return `href="${trackingUrl}"`;
      });

      const finalHtml = content.includes("</body>")
        ? content.replace("</body>", `${trackingPixel}</body>`)
        : content + trackingPixel;

      return sgMail.send({
        to: email,
        from: fromEmail,
        subject,
        html: finalHtml,
      });
    });

    await Promise.all(sendPromises);

    console.log(`✅ ${emails.length} emails sent for campaign: ${campaignName}`);
    return { success: true, emailsSent: emails.length };

 
} catch (error) {
  console.error("❌ sendCampaignUtility error:", error);

  if (error.response && error.response.body && error.response.body.errors) {
    console.error("🔍 SendGrid Error Details:", error.response.body.errors);
  }

  throw error;
}
};