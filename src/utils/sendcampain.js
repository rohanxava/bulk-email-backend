import sgMail from '@sendgrid/mail';
import Papa from 'papaparse';

const BASE_URL = "https://bulkmail.xavawebservices.com";

export const sendCampaignUtility = async (campaign) => {
  try {
    if (campaign.hasBeenSent) {
      console.log(`⚠️ Campaign ${campaign._id} already sent. Skipping.`);
      return { success: false, message: 'Campaign already sent' };
    }

    const {
      htmlContent,
      subject,
      fromEmail,
      csvContent = '',
      manualEmails = [],
      contacts = [],
      sendgridKey,
      _id,
      attachmentFile,
      attachmentMeta,
    } = campaign;

    if (!sendgridKey) {
      return { success: false, error: 'SendGrid API key missing' };
    }

    sgMail.setApiKey(sendgridKey);

    // Parse CSV contacts
    const csvContacts = csvContent
      ? Papa.parse(csvContent, { header: true, skipEmptyLines: true }).data
      : [];

    // Normalize manualEmails
    const manualContactObjects = (
      Array.isArray(manualEmails)
        ? manualEmails
        : typeof manualEmails === 'string'
          ? manualEmails.split(',').map(e => e.trim())
          : []
    ).map(entry => {
      if (typeof entry === 'string') {
        return { email: entry, firstName: '', lastName: '' };
      }
      if (typeof entry === 'object' && entry.email) {
        return {
          email: entry.email.trim(),
          firstName: entry.firstName || '',
          lastName: entry.lastName || ''
        };
      }
      return null;
    }).filter(Boolean);

    // Combine all contacts - CSV takes priority
    const allContacts = [...manualContactObjects, ...contacts, ...csvContacts];

    // Normalize field extractor
    const getField = (obj, keys) => {
      for (let key of keys) {
        const match = Object.keys(obj).find(k =>
          k.toLowerCase().replace(/\s/g, '') === key.toLowerCase().replace(/\s/g, '')
        );
        if (match) return obj[match];
      }
      return '';
    };

    // Deduplicate by email
    const uniqueContactsMap = {};
    for (const contact of allContacts) {
      const rawEmail = getField(contact, ['email']);
      if (!rawEmail) continue;

      const email = rawEmail.trim().toLowerCase();
      const firstName = getField(contact, ['firstName', 'firstname', 'first name']);
      const lastName = getField(contact, ['lastName', 'lastname', 'last name']);

      uniqueContactsMap[email] = {
        email,
        firstName,
        lastName,
        ...contact
      };
    }

    const finalContacts = Object.values(uniqueContactsMap);

    if (!finalContacts.length) {
      return { success: false, error: 'No valid contacts to send' };
    }

    const trackingPixel = `<img src="${BASE_URL}/api/tracking/open/${_id}" width="1" height="1" style="display:none;" />`;

    const sendPromises = finalContacts.map(contact => {
      const email = contact.email;
      const firstName = contact.firstName?.trim() || "Valued";
      const lastName = contact.lastName?.trim() || "Customer";

      console.log("📧 Sending to:", email, "| First Name:", firstName, "| Last Name:", lastName);

      let personalizedContent = htmlContent
        .replace(/{{firstName}}/g, firstName)
        .replace(/{{lastName}}/g, lastName);

      // Handle custom fields
      for (const key in contact) {
        const normalizedKey = key.toLowerCase().replace(/\s/g, '');
        if (["firstname", "first name", "lastname", "last name", "email"].includes(normalizedKey)) continue;

        const value = contact[key];
        if (value && typeof value !== 'object') {
          personalizedContent = personalizedContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }
      }

      // Add tracking links
      const withTrackedLinks = personalizedContent.replace(
        /href="([^"]+)"/g,
        (match, href) => {
          if (href.startsWith('#') || href.includes('/api/tracking/click')) return match;
          const trackingUrl = `${BASE_URL}/api/tracking/click/${_id}?redirect=${encodeURIComponent(href)}`;
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

      if (attachmentFile && attachmentMeta) {
        msg.attachments = [{
          content: attachmentFile,
          filename: attachmentMeta.filename,
          type: attachmentMeta.mimetype,
          disposition: 'attachment'
        }];
      }

      return sgMail.send(msg);
    });

    await Promise.all(sendPromises);


    return { success: true, emailsSent: finalContacts.length };
  } catch (err) {
    console.error("❌ sendCampaignUtility error:", err);
    if (err.response?.body?.errors) {
      console.error("📩 SendGrid Error Details:", JSON.stringify(err.response.body.errors, null, 2));
    }
    return { success: false, error: err.message };
  }
};
