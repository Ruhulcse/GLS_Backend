const express = require("express");
const { addMessage, getMessages } = require("../controllers/messageController");
const router = express.Router();
router.route("/message/").post(addMessage);
// router.route("/message/:chatId").get(getMessages);

module.exports = router;
