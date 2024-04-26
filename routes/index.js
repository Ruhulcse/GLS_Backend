const users = require("./userRoutes");
const shipment = require("./shipmentRoutes");
const blogs = require("./blogRoute");
const guide = require("./guideRoute");
const notification = require("./notificationRoute");
module.exports = [users, shipment, blogs, guide, notification];
