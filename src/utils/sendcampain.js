// sendCampaignUtility.js
import sgMail from '@sendgrid/mail';
import Papa from 'papaparse';

const BASE_URL = "https://bulkmail.xavawebservices.com";

export const sendCampaignUtility = async (campaign) => {
  try {
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

    const csvContacts = csvContent
      ? Papa.parse(csvContent, { header: true, skipEmptyLines: true }).data
      : [];

    const manualContactObjects = (Array.isArray(manualEmails)
      ? manualEmails
      : (typeof manualEmails === 'string'
        ? manualEmails.split(',').map(e => e.trim()).filter(e => e.includes("@"))
        : [])
    ).map(email => ({ email }));

    const allContacts = [...csvContacts, ...contacts, ...manualContactObjects];

    const uniqueContactsMap = {};
    allContacts.forEach(contact => {
      const emailKey = Object.keys(contact).find(key => key.toLowerCase() === 'email');
      if (emailKey && contact[emailKey]) {
        uniqueContactsMap[contact[emailKey].toLowerCase()] = contact;
      }
    });

    const finalContacts = Object.values(uniqueContactsMap);

    if (!finalContacts.length) {
      return { success: false, error: 'No valid contacts to send' };
    }

    const emails = finalContacts.map(c => {
      const emailKey = Object.keys(c).find(k => k.toLowerCase() === "email");
      return c[emailKey];
    });

    const trackingPixel = `<img src="${BASE_URL}/api/tracking/open/${_id}" width="1" height="1" style="display:none;" />`;

    const sendPromises = emails.map(email => {
      let personalizedContent = htmlContent;

      const contact = finalContacts.find(c => {
        const emailKey = Object.keys(c).find(k => k.toLowerCase() === 'email');
        return emailKey && c[emailKey].toLowerCase() === email.toLowerCase();
      }) || {};

      const getField = (obj, keys) => {
        for (let key of keys) {
          const match = Object.keys(obj).find(k => k.toLowerCase().replace(/\s/g, '') === key.toLowerCase().replace(/\s/g, ''));
          if (match) return obj[match];
        }
        return null;
      };

      const firstName = getField(contact, ["firstName", "firstname", "first name"]) || "Valued";
      const lastName = getField(contact, ["lastName", "lastname", "last name"]) || "Customer";

      personalizedContent = personalizedContent.replace(/{{firstName}}/g, firstName);
      personalizedContent = personalizedContent.replace(/{{lastName}}/g, lastName);

      for (const key in contact) {
        const normalizedKey = key.toLowerCase().replace(/\s/g, '');
        if (["firstname", "first name", "lastname", "last name", "email"].includes(normalizedKey)) continue;

        const value = contact[key];
        if (value && typeof value !== 'object') {
          personalizedContent = personalizedContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }
      }

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

    return { success: true, emailsSent: emails.length };
  } catch (err) {
  console.error("❌ sendCampaignUtility error:", err);

  if (err.response?.body?.errors) {
    console.error("📩 SendGrid Error Details:", JSON.stringify(err.response.body.errors, null, 2));
  }

  return { success: false, error: err.message };
}
};



