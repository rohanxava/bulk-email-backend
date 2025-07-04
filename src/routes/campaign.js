const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/save', campaignController.createOrUpdateCampaign);
router.post('/send', campaignController.sendCampaign);
router.delete('/:id', campaignController.deleteCampaign);
router.post('/send', campaignController.sendCampaign);


module.exports = router;