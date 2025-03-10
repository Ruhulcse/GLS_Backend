const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    cargoType: { type: String, required: true },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    weightKG: { type: Number, required: true },
    offeringPrice: { type: Number, required: true },
    numberOfLoads: { type: Number, required: true },
    pickUpDate: { type: Date, required: true },
    deliveryDate: { type: Date, required: true },
    shipperId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assuming you have a User model
    status: {
      type: String,
      enum: ["in transit", "delivered", "posted","accepted","rejected","assigned"],
      default: "posted",
    }, // Example statuses: posted, in transit, delivered
    bids: [
      {
        carrierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        brokerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        bidAmount: Number,
        proposedTimeline: Date,
        remarks: String,
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected", "delivered","assigned","in transit"],
          default: "pending",
        }, // Example statuses: pending, accepted, rejected
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
