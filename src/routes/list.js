const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const listController = require('../controllers/listController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), listController.uploadList);
router.get('/', listController.getLists);
router.delete('/:id', listController.deleteList);
router.get('/download/:id', listController.downloadList);


module.exports = router;
