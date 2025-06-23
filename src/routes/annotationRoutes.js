// routes/annotationRoutes.js
const express = require("express");
const router = express.Router();
const annotationController = require("../controllers/annotationController");
const {protect} = require("../middleware/protectMiddleware");


router.post("/", protect, annotationController.saveAnnotation);

router.get("/user/:userId", protect, annotationController.getAnnotationsByUser);

module.exports = router;
