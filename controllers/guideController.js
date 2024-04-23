const asyncHandler = require("express-async-handler");
const Guide = require("../models/GuideModel");

const createGuide = asyncHandler(async (req, res) => {
  const { creator, title, body, image, category, video, tags, type } = req.body;
  try {
    const newGuide = new Guide({
      creator,
      title,
      body,
      image,
      category,
      video,
      tags,
      type,
    });

    const data = await newGuide.save();
    res.status(201).json({
      message: "Guide created successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create guide",
      error: error.message,
    });
  }
});

const getAllGuide = asyncHandler(async (req, res) => {
  try {
    const guide = await Guide.find({});
    res.json({
      message: "Successfully retrieved all guides",
      data: guide,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving guides", error: error.message });
  }
});

const getGuideById = asyncHandler(async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      res.status(404).json({ message: "Guide not found" });
    } else {
      res.json(guide);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding guide", error: error.message });
  }
});

const updateGuide = asyncHandler(async (req, res) => {
  const { creator, title, body, image, category, video, tags, type } = req.body;
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      res.status(404).json({ message: "Guide not found" });
      return;
    }
    guide.title = title || guide.title;
    guide.body = body || guide.body;
    guide.image = image || guide.image;
    guide.category = category || guide.category;
    guide.video = video || guide.video;
    guide.tags = tags || guide.tags;
    guide.type = type || guide.type;

    const updatedGuide = await guide.save();

    res.json({
      message: "Guide updated successfully",
      data: updatedGuide,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update guide", error: error.message });
  }
});

const deleteGuide = asyncHandler(async (req, res) => {
  try {
    const guide = await Guide.findByIdAndDelete(req.params.id);
    if (!guide) {
      res.status(404).json({ message: "Guide not found" });
      return;
    }
    res.json({ message: "Guide deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete guide", error: error.message });
  }
});

module.exports = {
  createGuide,
  getAllGuide,
  deleteGuide,
  getGuideById,
  updateGuide,
};
