const mongoose = require("mongoose");
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,

    sendgridKey: {
      type: String,
      required: true,
    },
    fromEmail: {
  type: String,
  required: true,
},

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema); 