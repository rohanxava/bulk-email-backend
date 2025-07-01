// controllers/templateController.js
const Template = require('../models/template');

exports.createTemplate = async (req, res) => {
  const template = new Template(req.body);
  await template.save();
  res.json(template);
};

exports.getTemplatesByUser = async (req, res) => {
  const templates = await Template.find({ $or: [ { user: req.params.userId }, { isGlobal: true } ] });
  res.json(templates);
};
