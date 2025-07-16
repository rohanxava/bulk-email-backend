
import Analytics from "../models/analytics.js";
import Campaign from "../models/campaign.js";
import Subscriber from "../models/subscriber.js";

export const getAnalyticsSummary = async (req, res) => {
  try {
    const totalEmailsSent = await Campaign.aggregate([
      { $match: { status: "Sent" } },
      { $group: { _id: null, total: { $sum: "$recipients" } } },
    ]);

    const opened = await Campaign.aggregate([
      { $group: { _id: null, total: { $sum: "$stats.opened" } } }
    ]);

    const clicks = await Campaign.aggregate([
      { $group: { _id: null, total: { $sum: "$stats.clicks" } } }
    ]);
    const sent = totalEmailsSent[0]?.total || 1;

    const openRate = ((opened[0]?.total || 0) / sent) * 100;
    const clickRate = ((clicks[0]?.total || 0) / sent) * 100;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const newSubscribers = await Subscriber.countDocuments({ createdAt: { $gte: lastMonth } });

    let monthlyPerformance = await Campaign.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          desktop: { $sum: "$stats.desktop" },
          mobile: { $sum: "$stats.mobile" },
        },
      },
      {
        $project: {
          month: "$_id.month",
          desktop: 1,
          mobile: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    monthlyPerformance = monthlyPerformance.map((item) => ({
      ...item,
      month: monthNames[item.month - 1],
    }));

    res.json({
      totalEmailsSent: totalEmailsSent[0]?.total || 0,
      openRate: Number(openRate.toFixed(1)),
      clickRate: Number(clickRate.toFixed(1)),
      newSubscribers,
      monthlyPerformance,
    });
  } catch (err) {
    console.error("Analytics fetch error:", err);
    res.status(500).json({ message: "Failed to fetch analytics summary" });
  }
};




export const updateAnalyticsSummary = async (req, res) => {
  try {
    const data = await Analytics.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const getCampaignStatusCounts = async (req, res) => {
  try {
    const result = await Campaign.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const data = result.map((item) => ({
      status: item._id,
      count: item.count,
    }));

    res.json(data);
  } catch (err) {
    console.error("Error getting status counts:", err);
    res.status(500).json({ message: "Failed to fetch campaign status counts" });
  }
};
