const sgMail = require('@sendgrid/mail');
const EmailLog = require('../models/emaillog');
const Project = require('../models/project');

exports.sendEmail = async (req, res) => {
  const { to, subject, body, projectId } = req.body;

  if (!to || !subject || !body || !projectId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project || !project.sendgridKey) {
      return res.status(404).json({ message: 'Project or API Key not found' });
    }

    // ✅ Set key securely per project
    sgMail.setApiKey(project.sendgridKey);

    const msg = {
      to,
      from: 'no-reply@example.com', // must be verified on SendGrid
      subject,
      html: body,
    };

    await sgMail.send(msg);

    await EmailLog.create({ project: projectId, to, subject, body, status: 'Delivered' });

    res.json({ message: 'Email sent' });
  } catch (error) {
    console.error('SendGrid Error:', error.response?.body || error.message);
    await EmailLog.create({ project: projectId, to, subject, body, status: 'Failed' });
    res.status(500).json({ message: 'SendGrid error', error: error.message });
  }
};
