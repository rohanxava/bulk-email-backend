const Project = require("../models/project");
const createProject = async (req, res) => {
  console.log("Creating project...", req.body);

  try {
    const { name, description, sendgridKey, fromEmail } = req.body;

    if (!name || !sendgridKey || !fromEmail) {
      return res.status(400).json({ message: "Project name, SendGrid key, and From Email are required" });
    }

    const newProject = new Project({
      name,
      description,
      sendgridKey,
      fromEmail,
      createdBy: req.user._id
    });


    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
};


const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user._id });
    res.status(200).json(projects); // ✅ plain array
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects", error });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to get project", error });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description, sendgridKey, fromEmail } = req.body;

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        sendgridKey,
        fromEmail
      }, { new: true });
    if (!updated) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update project", error });
  }
};

const deleteProject = async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project", error });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
