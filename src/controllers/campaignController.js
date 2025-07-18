import Campaign from '../models/campaign.js';
import sgMail from '@sendgrid/mail';
import Papa from 'papaparse';


export const sendCampaign = async (req, res) => {
  console.log("📨 Incoming sendCampaign request");

  try {
    const {
      subject,
      htmlContent,
      manualEmails,
      fromEmail,
      sendgridKey,
      campaignName,
      createdBy,
      projectId,
      templateId
    } = req.body;

    let csvContent = req.body.csvContent || "";
    const contacts = csvContent
      ? Papa.parse(csvContent, { header: true, skipEmptyLines: true }).data
      : [];

    const emails = [
      ...contacts
        .map(contact => {
          const emailKey = Object.keys(contact).find(key => key.toLowerCase() === "email");
          return emailKey ? contact[emailKey].trim() : null;
        })
        .filter(Boolean),
      ...(
        Array.isArray(manualEmails)
          ? manualEmails
          : (manualEmails && typeof manualEmails === "string")
              ? manualEmails.split(",").map(e => e.trim()).filter(e => e.includes("@"))
              : []
      )
    ];

    if (emails.length === 0) {
      return res.status(400).json({ error: "No recipients provided" });
    }

    if (!sendgridKey) {
      return res.status(400).json({ error: 'SendGrid API key is missing' });
    }
    sgMail.setApiKey(sendgridKey);

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
      stats: { opened: 0, clicks: 0, desktop: 0, mobile: 0 }
    });

    const BASE_URL = "https://bulkmail.xavawebservices.com";
    const trackingPixel = `<img src="${BASE_URL}/api/tracking/open/${campaign._id}" width="1" height="1" style="display:none;" />`;

    // Handle PDF Attachment
    let attachment = null;
    if (req.file) {
      attachment = {
        content: req.file.buffer.toString('base64'),
        filename: req.file.originalname,
        type: req.file.mimetype,
        disposition: 'attachment'
      };
    }

    const sendPromises = emails.map(email => {
      let personalizedContent = htmlContent;
      const firstContact = contacts.find(c => {
        const emailKey = Object.keys(c).find(k => k.toLowerCase() === "email");
        return emailKey && c[emailKey].trim() === email;
      }) || {};

      for (const key in firstContact) {
        personalizedContent = personalizedContent.replace(
          new RegExp(`{{${key}}}`, 'g'),
          firstContact[key]
        );
      }

      const withTrackedLinks = personalizedContent.replace(
        /href="([^"]+)"/g,
        (match, href) => {
          if (href.startsWith('#') || href.includes('/api/tracking/click')) return match;
          const trackingUrl = `${BASE_URL}/api/tracking/click/${campaign._id}?redirect=${encodeURIComponent(href)}`;
          return `href="${trackingUrl}"`;
        }
      );

      const finalHtml = withTrackedLinks.includes("</body>")
        ? withTrackedLinks.replace("</body>", `${trackingPixel}</body>`)
        : withTrackedLinks + trackingPixel;

      const msg = {
        to: email,
        from: fromEmail,
        subject,
        html: finalHtml,
      };

      if (attachment) {
        msg.attachments = [attachment];
      }

      return sgMail.send(msg);
    });

    await Promise.all(sendPromises);

    res.status(200).json({
      success: true,
      message: "Campaign sent with " + (attachment ? "attachment" : "no attachment"),
      emailsSent: emails.length
    });

  } catch (err) {
    console.error('❌ Error sending campaign:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to send campaign' });
  }
};



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
