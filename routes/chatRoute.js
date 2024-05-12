const express = require("express");
const {
  createChat,
  userChats,
  findChat,
} = require("../controllers/chatController");
const router = express.Router();
router.route("/chat/").post(createChat);
router.route("/chat/:userId").get(userChats);
router.route("/chat/find/:firstId/:secondId", findChat);

module.exports = router;
