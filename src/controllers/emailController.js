const sgMail = require('@sendgrid/mail');
const EmailLog = require('../models/emaillog');

exports.sendEmail = async (req, res) => {
  const { to, subject, body, apiKey, projectId } = req.body;
  if (!to || !subject || !body || !apiKey || !projectId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  sgMail.setApiKey(apiKey);
  const msg = { to, from: 'no-reply@example.com', subject, html: body };

  try {
    await sgMail.send(msg);
    await EmailLog.create({ project: projectId, to, subject, body, status: 'Delivered' });
    res.json({ message: 'Email sent' });
  } catch (error) {
    await EmailLog.create({ project: projectId, to, subject, body, status: 'Failed' });
    res.status(500).json({ message: 'SendGrid error', error: error.message });
  }
};
