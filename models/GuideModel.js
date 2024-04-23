const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      //required: true,
    },
    type: {
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
    video: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("guideSchema", guideSchema);
