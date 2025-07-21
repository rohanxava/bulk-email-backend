const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const listController = require('../controllers/listController');
const authMiddleware = require('../middleware/authMiddleware')

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), authMiddleware, listController.uploadList);
router.get('/',authMiddleware, listController.getLists);
router.delete('/:id',authMiddleware, listController.deleteList);
router.get('/download/:id', authMiddleware, listController.downloadList);


module.exports = router;
