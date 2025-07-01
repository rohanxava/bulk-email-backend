
// controllers/projectController.js
const Project = require('../models/project');

exports.createProject = async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.json(project);
};

exports.getProjectsByUser = async (req, res) => {
  const projects = await Project.find({ user: req.params.userId });
  res.json(projects);
};
