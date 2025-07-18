const express = require('express');
const templateController = require('../controllers/templateController');
const router = express.Router();
const upload = require('../middleware/multer')

router.get('/', templateController.getTemplates);             // GET all templates
router.post('/',upload.single('attachment'),templateController.createTemplate); 
router.put('/:id', upload.single('attachment'), templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);     // DELETE a template
router.get("/:id", templateController.getTemplateById);


module.exports = router;
