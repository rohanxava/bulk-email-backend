const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const multer = require('multer');

const storage = multer.memoryStorage(); // Store file in memory (no need to save on disk)
const upload = multer({ storage });

router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/save', campaignController.createOrUpdateCampaign);

// 🔥 Use multer for /send route to handle PDF attachment
router.post('/send', upload.single('attachment'), campaignController.sendCampaign);

router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;
