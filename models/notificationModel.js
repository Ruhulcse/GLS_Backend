const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, require: true },
    title: { type: String, require: true },
    text: { type: String, require: true },
    link: { type: String, require: false },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notificationSchema", notificationSchema);
