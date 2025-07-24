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
      // service,
      // apiKey,
      campaignName,
      createdBy,
      projectId,
      templateId,
      listContacts,
      scheduleDate
    } = req.body;

    let csvContent = req.body.csvContent || "";

    // 🔹 Parse CSV contacts
    const csvContacts = csvContent
      ? Papa.parse(csvContent, { header: true, skipEmptyLines: true }).data
      : [];

    // 🔹 Parse dropdown (list) contacts
    let dropdownContacts = [];
    if (listContacts) {
      try {
        dropdownContacts = typeof listContacts === 'string'
          ? JSON.parse(listContacts)
          : listContacts;
      } catch (err) {
        console.error("Failed to parse listContacts:", listContacts);
        dropdownContacts = [];
      }
    }

    // 🔹 Manual emails → contact objects
    const manualContactObjects = (Array.isArray(manualEmails)
      ? manualEmails
      : (typeof manualEmails === "string")
        ? manualEmails.split(",").map(e => e.trim()).filter(e => e.includes("@"))
        : []
    ).map(email => ({ email }));

    // 🔹 Combine all contacts
    const allContacts = [...manualContactObjects, ...dropdownContacts, ...csvContacts];

    // 🔹 Deduplicate by email
    const uniqueContactsMap = {};
    allContacts.forEach(contact => {
      const emailKey = Object.keys(contact).find(key => key.toLowerCase() === "email");
      if (emailKey && contact[emailKey]) {
        uniqueContactsMap[contact[emailKey].toLowerCase()] = contact;
      }
    });

    const finalContacts = Object.values(uniqueContactsMap);

    if (!finalContacts.length) {
      return res.status(400).json({ error: "No valid contacts provided" });
    }

    if (!sendgridKey) {
      return res.status(400).json({ error: 'SendGrid API key is missing' });
    }

    sgMail.setApiKey(sendgridKey);

    const emails = finalContacts.map(c => {
      const emailKey = Object.keys(c).find(k => k.toLowerCase() === "email");
      return c[emailKey];
    });

    const parsedSchedule = scheduleDate ? new Date(scheduleDate) : null;
    const now = new Date();
    const isFutureSchedule = parsedSchedule && parsedSchedule > now;
    // 🔹 Handle file attachment (PDF, etc.)
    let attachment = null;

    if (req.file) {
      // 🟢 Priority 1: uploaded file
      attachment = {
        content: req.file.buffer.toString('base64'),
        filename: req.file.originalname,
        type: req.file.mimetype,
        disposition: 'attachment'
      };
    } else if (templateId) {
      // 🟡 Priority 2: template attachment
      const template = await Template.findById(templateId);
      if (template?.attachment) {
        attachment = {
          content: template.attachment,
          filename: 'attachment.pdf', // or retrieve from saved meta
          type: 'application/pdf',
          disposition: 'attachment'
        };
      }
    }
    
    let attachmentFile = null;
    let attachmentMeta = null;

    if (attachment) {
      attachmentFile = attachment.content;
      attachmentMeta = {
        filename: attachment.filename,
        mimetype: attachment.type,
        disposition: attachment.disposition
      };
    }
    const campaign = await Campaign.create({
      campaignName,
      subject,
      htmlContent,
      status: isFutureSchedule ? 'Scheduled' : 'Sent',
      recipients: emails.length,
      createdBy,
      csvContent,
      manualEmails,
      fromEmail,
      projectId,
      templateId,
      scheduleDate: parsedSchedule || null,
      contacts: finalContacts,
      stats: { opened: 0, clicks: 0, desktop: 0, mobile: 0 },
      ...(attachmentFile && { attachmentFile }),
      ...(attachmentMeta && { attachmentMeta })
    });


    // 🔹 Handle scheduled campaigns
    if (isFutureSchedule) {
      return res.status(200).json({
        success: true,
        message: `Campaign scheduled for ${parsedSchedule.toISOString()}`,
        scheduled: true,
        emailsScheduled: finalContacts.length

      });
    }

    // 🔹 Proceed with immediate send
    const BASE_URL = "https://bulkmail.xavawebservices.com";
    const trackingPixel = `<img src="${BASE_URL}/api/tracking/open/${campaign._id}" width="1" height="1" style="display:none;" />`;


    const sendPromises = emails.map(email => {
      let personalizedContent = htmlContent;

      const contact = finalContacts.find(c => {
        const emailKey = Object.keys(c).find(k => k.toLowerCase() === "email");
        return emailKey && c[emailKey].toLowerCase() === email.toLowerCase();
      }) || {};

      const getField = (obj, keys) => {
        for (let key of keys) {
          const match = Object.keys(obj).find(k =>
            k.toLowerCase().replace(/\s/g, '') === key.toLowerCase().replace(/\s/g, '')
          );
          if (match) return obj[match];
        }
        return null;
      };

      const firstName = getField(contact, ["firstName", "firstname", "first name"]) || "Valued";
      const lastName = getField(contact, ["lastName", "lastname", "last name"]) || "Customer";

      personalizedContent = personalizedContent
        .replace(/{{firstName}}/g, firstName)
        .replace(/{{lastName}}/g, lastName);

      // Replace other custom fields
      for (const key in contact) {
        const normKey = key.toLowerCase().replace(/\s/g, '');
        if (
          !["firstname", "first name", "lastname", "last name", "email"].includes(normKey) &&
          typeof contact[key] !== 'object' &&
          contact[key] !== null &&
          contact[key] !== undefined
        ) {
          personalizedContent = personalizedContent.replace(
            new RegExp(`{{${key}}}`, 'g'),
            String(contact[key])
          );
        }
      }

      // Add link tracking
      const withTrackedLinks = personalizedContent.replace(
        /href="([^"]+)"/g,
        (match, href) => {
          if (href.startsWith('#') || href.includes('/api/tracking/click')) return match;
          const tracked = `${BASE_URL}/api/tracking/click/${campaign._id}?redirect=${encodeURIComponent(href)}`;
          return `href="${tracked}"`;
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
        ...(attachment && { attachments: [attachment] })
      };

      return sgMail.send(msg);
    });

    await Promise.all(sendPromises);

    res.status(200).json({
      success: true,
      message: "Campaign sent successfully",
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
