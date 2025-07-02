const express = require("express");
const projectsController = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, projectsController.createProject);
router.get("/", authMiddleware, projectsController.getProjects);
router.get("/:id", authMiddleware, projectsController.getProjectById);
router.put("/:id", authMiddleware, projectsController.updateProject);
router.delete("/:id", authMiddleware, projectsController.deleteProject);

module.exports = router;
