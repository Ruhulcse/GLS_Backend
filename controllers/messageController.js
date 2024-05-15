const MessageModel = require("../models/MessageModel");
const { getIO, userSockets } = require("../socket");

const addMessage = async (req, res) => {
  const senderId = req.user._id;
  const { chatId, text, receiverId } = req.body;
  const message = new MessageModel({
    chatId,
    senderId,
    text,
  });
  try {
    //sent this msg to reciver
    const io = getIO();
    const msgReciever = userSockets.get(receiverId);
    if (msgReciever) {
      io.to(msgReciever.id).emit("rcvmsg", {
        chatId,
        text,
        senderId,
        receiverId,
      });
    } else {
      console.log("receiver is not connected");
    }
    const result = await message.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const result = await MessageModel.find({ chatId });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  addMessage,
  getMessages,
};
