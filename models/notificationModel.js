const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sender_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    recipient_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    link: { type: String, required: false },
    isRead: { type: Boolean, default: false },
    additional_data: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notificationSchema", notificationSchema);
