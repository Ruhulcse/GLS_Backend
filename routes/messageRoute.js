const express = require("express");
const { addMessage, getMessages } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.route("/message/").post(protect, addMessage);
router.route("/message/:chatId").get(getMessages);

module.exports = router;
