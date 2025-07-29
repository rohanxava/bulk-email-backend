import sgMail from '@sendgrid/mail';
import Papa from 'papaparse';

const BASE_URL = "https://bulkmail.xavawebservices.com";

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

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

    const csvContacts = csvContent
      ? Papa.parse(csvContent, { header: true, skipEmptyLines: true }).data
      : [];

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

    const allContacts = [...manualContactObjects, ...contacts, ...csvContacts];

    const getField = (obj, keys) => {
      for (let key of keys) {
        const match = Object.keys(obj).find(k =>
          k.toLowerCase().replace(/\s/g, '') === key.toLowerCase().replace(/\s/g, '')
        );
        if (match) return obj[match];
      }
      return '';
    };

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

    const BATCH_SIZE = 100;
    const contactChunks = chunkArray(finalContacts, BATCH_SIZE);

    for (let i = 0; i < contactChunks.length; i++) {
      const chunk = contactChunks[i];
      console.log(`📦 Sending batch ${i + 1}/${contactChunks.length} (${chunk.length} emails)`);

      const sendChunkPromises = chunk.map(contact => {
        const email = contact.email;
        const firstName = contact.firstName?.trim() || "Valued";
        const lastName = contact.lastName?.trim() || "Customer";

        console.log(`📧 Sending to: ${email} | First Name: ${firstName} | Last Name: ${lastName}`);

        let personalizedContent = htmlContent
          .replace(/{{firstName}}/g, firstName)
          .replace(/{{lastName}}/g, lastName);

        for (const key in contact) {
          const normKey = key.toLowerCase().replace(/\s/g, '');
          if (["firstname", "first name", "lastname", "last name", "email"].includes(normKey)) continue;

          const value = contact[key];
          if (value && typeof value !== 'object') {
            personalizedContent = personalizedContent.replace(
              new RegExp(`{{${key}}}`, 'g'),
              String(value)
            );
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
          ...(attachmentFile && attachmentMeta && {
            attachments: [{
              content: attachmentFile,
              filename: attachmentMeta.filename,
              type: attachmentMeta.mimetype,
              disposition: 'attachment'
            }]
          })
        };

        return sgMail.send(msg);
      });

      await Promise.all(sendChunkPromises);

      if (i < contactChunks.length - 1) {
        console.log("⏳ Waiting 1 second before next batch...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { success: true, emailsSent: finalContacts.length };
  } catch (err) {
    console.error("❌ sendCampaignUtility error:", err);
    if (err.response?.body?.errors) {
      console.error("📩 SendGrid Error Details:", JSON.stringify(err.response.body.errors, null, 2));
    }
    return { success: false, error: err.message };
  }
};
