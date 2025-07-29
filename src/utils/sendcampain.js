import sgMail from '@sendgrid/mail';
import Papa from 'papaparse';
import Campaign from '../models/campaign.js';

const BASE_URL = "https://bulkmail.xavawebservices.com";

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && re.test(email) && email.length <= 254;
};

export const sendCampaignUtility = async (campaign) => {
  try {
    if (campaign.hasBeenSent) {
      console.log(`⚠️ Campaign ${campaign._id} already sent. Skipping.`);
      return { success: false, message: 'Campaign already sent' };
    }

    const locked = await Campaign.findOneAndUpdate(
      { _id: campaign._id, hasBeenSent: false, status: { $ne: "sending" } },
      { $set: { status: "sending", sendingStartedAt: new Date() } },
      { new: true }
    );

    if (!locked) {
      console.log(`🔒 Campaign ${campaign._id} is already being processed. Skipping.`);
      return { success: false, message: 'Campaign is already being processed' };
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
          email: String(entry.email).trim(),
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

      const email = String(rawEmail).trim().toLowerCase();
      const firstName = getField(contact, ['firstName', 'firstname', 'first name']);
      const lastName = getField(contact, ['lastName', 'lastname', 'last name']);

      if (!isValidEmail(email)) {
        console.warn(`⚠️ Invalid email skipped: ${email}`);
        continue;
      }

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

    const BATCH_SIZE = 200;
    const contactChunks = chunkArray(finalContacts, BATCH_SIZE);
    let failedEmails = [];

    for (let i = 0; i < contactChunks.length; i++) {
      const chunk = contactChunks[i];
      console.log(`📦 Sending batch ${i + 1}/${contactChunks.length} (${chunk.length} emails)`);

      const sendChunkPromises = chunk.map(async (contact) => {
        const email = String(contact.email).trim().toLowerCase();
        const firstName = contact.firstName?.trim() || "Valued";
        const lastName = contact.lastName?.trim() || "Customer";

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

        try {
          await sgMail.send(msg);
          console.log(`✅ Sent to: ${email}`);
        } catch (err) {
          failedEmails.push(email);
          const errorMsg = err.response?.body?.errors || err.message;
          console.error(`❌ Failed to send to ${email}:`, errorMsg);

          // Retry once if rate limited
          if (err.code === 429 || (err.response && err.response.statusCode === 429)) {
            console.warn(`🕒 Rate limit hit for ${email}, retrying after delay...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
            try {
              await sgMail.send(msg);
              console.log(`🔁 Retry successful for ${email}`);
            } catch (retryErr) {
              console.error(`❌ Retry failed for ${email}:`, retryErr.response?.body?.errors || retryErr.message);
            }
          }
        }
      });

      await Promise.all(sendChunkPromises);

      if (i < contactChunks.length - 1) {
        console.log("⏳ Waiting 2 seconds before next batch...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const successCount = finalContacts.length - failedEmails.length;

    if (successCount > 0) {
      await Campaign.findByIdAndUpdate(_id, {
        hasBeenSent: true,
        status: "sent",
        sentAt: new Date()
      });
      console.log(`✅ Campaign ${_id} marked as sent.`);
    } else {
      console.warn(`⚠️ Campaign ${_id} had no successful sends. Not marking as sent.`);
    }

    return {
      success: successCount > 0,
      emailsSent: successCount,
      failedEmails
    };

  } catch (err) {
    console.error("❌ sendCampaignUtility error:", err);
    if (err.response?.body?.errors) {
      console.error("📩 SendGrid Error Details:", JSON.stringify(err.response.body.errors, null, 2));
    }
    return { success: false, error: err.message };
  }
};
