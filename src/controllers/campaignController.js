import Campaign from '../models/campaign.js';

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdDate: -1 });
    res.status(200).json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.status(200).json(campaign);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching campaign' });
  }
};

export const createOrUpdateCampaign = async (req, res) => {
  const { id, name, subject, htmlContent, status, recipients, createdBy } = req.body;

  try {
    let campaign;
    if (id) {
      campaign = await Campaign.findByIdAndUpdate(
        id,
        { name, subject, htmlContent, status, recipients, createdBy },
        { new: true }
      );
    } else {
      campaign = await Campaign.create({ name, subject, htmlContent, status, recipients, createdBy });
    }
    res.status(200).json(campaign);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save campaign' });
  }
};
