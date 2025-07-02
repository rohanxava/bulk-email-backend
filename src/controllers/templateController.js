import Template from '../models/template.js';

export const createTemplate = async (req, res) => {
  try {
    const { name, subject, htmlContent, projectId } = req.body;
    const template = new Template({ name, subject, htmlContent, projectId });
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create template', error: err.message });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find().sort({ updatedAt: -1 });
    res.status(200).json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch templates', error: err.message });
  }
};

// ✅ Update Template by ID
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, htmlContent, projectId } = req.body;

    const updated = await Template.findByIdAndUpdate(
      id,
      { name, subject, htmlContent, projectId },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update template', error: err.message });
  }
};

// ✅ Delete Template by ID
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Template.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete template', error: err.message });
  }
};
