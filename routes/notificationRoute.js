const express = require("express");
const router = express.Router();
const { protect, IsSupperadmin } = require("../middleware/auth");
const {
  getAllNotifications,
  getNotificationsForUser,
  getNotificationById,
  markNotificationAsRead,
} = require("../controllers/notificationController");

// Route to retrieve notifications
router.route("/notifications").get(protect, getNotificationsForUser);

router.route("/notifications/:id").get(protect, getNotificationById);

router
  .route("/notifications/:id/markAsRead")
  .post(protect, markNotificationAsRead);

module.exports = router;
