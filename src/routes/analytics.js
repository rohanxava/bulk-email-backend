const express= require('express');
const analyticsController = require('../controllers/analyticsController');  
const router = express.Router();

router.get("/summary", analyticsController.getAnalyticsSummary);
router.put("/summary", analyticsController.updateAnalyticsSummary);
router.get("/status-counts", getCampaignStatusCounts);
module.exports = router;