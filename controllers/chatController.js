const ChatModel = require("../models/chatModel.js");
const MessageModel = require("../models/MessageModel.js");
const UserModel = require("../models/userModel.js");
const { getIO, userSockets } = require("../socket");
const createChat = async (req, res) => {
  const senderId = req.user._id;
  const newChat = new ChatModel({
    members: [senderId, req.body.receiverId],
  });
  try {
    const result = await newChat.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const userChats = async (req, res) => {
  try {
    // Fetch chats where the user is a member
    const chats = await ChatModel.find({
      members: { $in: [req.params.userId] },
    }).populate("members", "firstName lastName userType status");

    const chatDetails = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await MessageModel.findOne({
          chatId: chat._id,
        }).sort({ createdAt: -1 });

        const members = await Promise.all(
          chat.members.map(async (member) => {
            const SocketData = userSockets.get(member._id.toString());
            return {
              _id: member._id,
              fullName: `${member.firstName} ${member.lastName}`,
              role: member.userType,
              status: SocketData?.id ? "online" : "offline",
              lastMessage: lastMessage ? lastMessage.text : "No messages yet",
              lastMessageTime: lastMessage ? lastMessage.createdAt : null,
            };
          })
        );

        return {
          _id: chat._id,
          members: members,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
      })
    );

    res.status(200).json(chatDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const findChat = async (req, res) => {
  try {
    const chat = await ChatModel.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  createChat,
  userChats,
  findChat,
};
