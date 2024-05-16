const express = require("express");
const {
  createChat,
  userChats,
  findChat,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.route("/chat/").post(protect, createChat);
router.route("/chat/:userId").get(userChats);
router.route("/chat/find/:firstId/:secondId").get(findChat);

module.exports = router;
