const Template = require('../models/template');

exports.createTemplate = async (req, res) => {
  try {
    const template = new Template(req.body);
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Error creating template', error: err.message });
  }
};

exports.getTemplatesByUser = async (req, res) => {
  try {
    const templates = await Template.find({
      $or: [{ user: req.params.userId }, { isGlobal: true }]
    });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching templates', error: err.message });
  }
};
