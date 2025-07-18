import Template from '../models/template.js';


export const createTemplate = async (req, res) => {
  try {
    const { name, subject, htmlContent, projectId } = req.body;

    const attachmentPath = req.file ? req.file.path : null;

    const template = new Template({
      name,
      subject,
      htmlContent,
      projectId,
      attachment: attachmentPath,
    });

    await template.save();

    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create template', error: err.message });
  }
};




export const getTemplateById = async (req, res) => {
  try {
    const templateId = req.params.id;

    if (!templateId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid template ID format" });
    }

    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

    const attachmentUrl = template.attachment
      ? `${template.attachment.replace(/\\/g, "/")}`
      : null;

    res.json({
      _id: template._id,
      projectId: template.projectId,
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      attachment: attachmentUrl,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getTemplates = async (req, res) => {
  try {
    const { projectId } = req.query;

    // If projectId is passed, filter by it
    const filter = projectId ? { projectId } : {};

    const templates = await Template.find(filter).sort({ updatedAt: -1 });

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

    const updateData = { name, subject, htmlContent, projectId };

    if (req.file) {
      // Save file path to DB (relative or absolute as per your system)
      const fileUrl = `/uploads/templates/${req.file.filename}`;
      updateData.attachment = fileUrl;
    }

    const updated = await Template.findByIdAndUpdate(id, updateData, { new: true });

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
