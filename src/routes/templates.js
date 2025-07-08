const express = require('express');
const templateController = require('../controllers/templateController');
const router = express.Router();

router.get('/', templateController.getTemplates);             // GET all templates
router.post('/', templateController.createTemplate);          // POST new template
router.put('/:id', templateController.updateTemplate);        // PUT update template
router.delete('/:id', templateController.deleteTemplate);     // DELETE a template
router.get("/:id", templateController.getTemplateById);


module.exports = router;
