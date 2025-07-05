import Campaign from '../models/campaign.js';
import sgMail from '@sendgrid/mail';
import Papa from 'papaparse';

export const sendCampaign = async (req, res) => {
  console.log("📨 Incoming sendCampaign request:", req.body);

  try {
    const {
      subject,
      htmlContent,
      csvContent,
      manualEmails,
      fromEmail,
      sendgridKey,
      campaignName,
      createdBy,
      projectId,
      templateId
    } = req.body;

    if (!sendgridKey) {
      return res.status(400).json({ error: 'SendGrid API key is missing' });
    }
    sgMail.setApiKey(sendgridKey);

    // Parse contacts
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    const contacts = parsed.data;

    const emails = [
  ...contacts.map(contact => {
    const emailKey = Object.keys(contact).find(key => key.toLowerCase() === "email");
    return emailKey ? contact[emailKey].trim() : null;
  }).filter(Boolean),
  ...(manualEmails || [])
];


    // ✅ Create campaign first to get ID
    const campaign = await Campaign.create({
      campaignName,
      subject,
      htmlContent,
      status: 'Sent',
      recipients: emails.length,
      createdBy,
      csvContent,
      manualEmails,
      fromEmail,
      projectId,
      templateId,
      stats: {
        opened: 0,
        clicks: 0,
        desktop: 0,
        mobile: 0
      }
    });

    // ✅ Use ngrok BASE_URL
    const BASE_URL = "https://b52e-2405-201-5023-481e-8c82-a29b-dc5c-5b09.ngrok-free.app";

    const trackingPixel = `<img src="${BASE_URL}/api/tracking/open/${campaign._id}" width="1" height="1" style="display:none;" />`;

    const sendPromises = emails.map(email => {
      let personalizedContent = htmlContent;

      // Replace placeholders with values (if CSV contact exists)
      const firstContact = contacts.find(c => c.email === email) || {};
      for (const key in firstContact) {
        personalizedContent = personalizedContent.replace(
          new RegExp(`{{${key}}}`, 'g'),
          firstContact[key]
        );
      }

      // ✅ Rewrite all links to go through click tracker
      const withTrackedLinks = personalizedContent.replace(
        /href="([^"]+)"/g,
        (match, href) => {
          if (href.startsWith('#') || href.includes('/api/tracking/click')) return match;
          const trackingUrl = `${BASE_URL}/api/tracking/click/${campaign._id}?redirect=${encodeURIComponent(href)}`;
          return `href="${trackingUrl}"`;
        }
      );

      // ✅ Inject open pixel
      const finalHtml = withTrackedLinks.includes("</body>")
        ? withTrackedLinks.replace("</body>", `${trackingPixel}</body>`)
        : withTrackedLinks + trackingPixel;

    //   return sgMail.send({
    //     to: email,
    //     from: fromEmail,
    //     subject,
    //     html: finalHtml
    //   });
    // });


    return sgMail.send({
  to: email,
  from: fromEmail,
  subject,
  content: [
    {
      type: 'text/html',
      value: finalHtml  
    }
  ]
});
  });

    await Promise.all(sendPromises);

    res.status(200).json({
      success: true,
      message: "Campaign sent",
      emailsSent: emails.length
    });

  } catch (err) {
    console.error('❌ Error sending campaign:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to send campaign' });
  }
};



// 📌 Get all campaigns
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
  .sort({ createdDate: -1 })
  .populate('createdBy', 'name');
    res.status(200).json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

// 📌 Get a campaign by ID
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.status(200).json(campaign);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching campaign' });
  }
};

// 📌 Create or Update Campaign
export const createOrUpdateCampaign = async (req, res) => {
  const {
    id, campaignName, subject, htmlContent, status,
    recipients, createdBy, csvContent, manualEmails, fromEmail,
    projectId,         // ✅ ADDED
    templateId         // ✅ ADDED
  } = req.body;

  try {
    let campaign;
    if (id) {
      campaign = await Campaign.findByIdAndUpdate(
        id,
        {
          campaignName,
          subject,
          htmlContent,
          status,
          recipients,
          createdBy,
          csvContent,
          manualEmails,
          fromEmail,
          projectId,      // ✅ UPDATED
          templateId      // ✅ UPDATED
        },
        { new: true }
      );
    } else {
      campaign = await Campaign.create({
        campaignName,
        subject,
        htmlContent,
        status,
        recipients,
        createdBy,
        csvContent,
        manualEmails,
        fromEmail,
        projectId,       // ✅ SAVED
        templateId       // ✅ SAVED
      });
    }

    res.status(200).json(campaign);
  } catch (err) {
    console.error("❌ Campaign Creation/Update Error:", err);
    res.status(500).json({ error: 'Failed to save campaign' });
  }
};


// 📌 Delete Campaign
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
};
