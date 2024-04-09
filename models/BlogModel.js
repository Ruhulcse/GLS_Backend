const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null, // assuming URL to an image
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: { type: String, default: "posted" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blogSchema", blogSchema);
