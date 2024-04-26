const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel"); // Adjust the path as needed

// Get all notifications
const getAllNotifications = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({});
    res.json({
      message: "Successfully retrieved all notifications",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving notifications",
      error: error.message,
    });
  }
});

// Get single notification by ID
const getNotificationById = asyncHandler(async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
    } else {
      res.json({
        message: "Notification found",
        data: notification,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding notification", error: error.message });
  }
});

// Mark a notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      message: "Notification marked as read successfully",
      data: notification,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update notification", error: error.message });
  }
});

// Optional: Get all notifications for a specific user
const getNotificationsForUser = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient_id: req.user._id,
    }); // Assuming you have a user object attached to the request
    res.json({
      message: "Successfully retrieved notifications for user",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving notifications",
      error: error.message,
    });
  }
});

module.exports = {
  getAllNotifications,
  getNotificationById,
  markNotificationAsRead,
  getNotificationsForUser,
};
