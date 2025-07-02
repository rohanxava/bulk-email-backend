const express = require('express');
const campaignController = require('../controllers/campaignController');

const router = express.Router();

router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/save', campaignController.createOrUpdateCampaign);

module.exports = router;