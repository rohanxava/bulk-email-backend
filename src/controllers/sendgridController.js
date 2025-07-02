import SendGridKey from "../models/SendGridKey.js";

// Add API key to a project
export const addSendGridKey = async (req, res) => {
  try {
    const { key, projectId } = req.body;

    const newKey = new SendGridKey({
      key,
      projectId,
      createdBy: req.user?._id,
    });

    const savedKey = await newKey.save();
    res.status(201).json(savedKey);
  } catch (error) {
    res.status(500).json({ message: "Failed to add SendGrid key", error });
  }
};

// Get API key for a project
export const getSendGridKey = async (req, res) => {
  try {
    const { projectId } = req.params;
    const key = await SendGridKey.findOne({ projectId });
    if (!key) return res.status(404).json({ message: "API key not found" });
    res.status(200).json(key);
  } catch (error) {
    res.status(500).json({ message: "Failed to get SendGrid key", error });
  }
};

// Update API key
export const updateSendGridKey = async (req, res) => {
  try {
    const { key } = req.body;
    const { projectId } = req.params;

    const updated = await SendGridKey.findOneAndUpdate(
      { projectId },
      { key },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Key not found" });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update key", error });
  }
};

// Delete API key
export const deleteSendGridKey = async (req, res) => {
  try {
    const { projectId } = req.params;
    await SendGridKey.findOneAndDelete({ projectId });
    res.status(200).json({ message: "API key deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete key", error });
  }
};
