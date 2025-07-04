const express = require("express");
const Subscriber = require("../models/subscriber");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, name } = req.body;
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Already subscribed" });
    }
    const newSubscriber = await Subscriber.create({ email, name });
    res.status(201).json(newSubscriber);
  } catch (err) {
    console.error("Subscriber error:", err);
    res.status(500).json({ message: "Failed to subscribe" });
  }
});

module.exports = router;
