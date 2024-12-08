const users = require("./userRoutes");
const shipment = require("./shipmentRoutes");
const blogs = require("./blogRoute");
const guide = require("./guideRoute");
const notification = require("./notificationRoute");
const chat = require("./chatRoute");
const message = require("./messageRoute");
const payment = require("./paymentRoute");
const contact = require("./contactRoute")
module.exports = [
  users,
  shipment,
  blogs,
  guide,
  notification,
  chat,
  message,
  payment,
  contact
];
