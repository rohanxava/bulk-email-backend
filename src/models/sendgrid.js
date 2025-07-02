import mongoose from "mongoose";

const sendGridKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

const SendGridKey = mongoose.model("SendGridKey", sendGridKeySchema);
export default SendGridKey;
