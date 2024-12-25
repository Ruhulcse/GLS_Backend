const asyncHandler = require("express-async-handler");
const Shipment = require("../models/shipmentModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

const { getIO, userSockets } = require("../socket");

// Post a new shipment
const createShipment = asyncHandler(async (req, res) => {
  const {
    origin,
    destination,
    cargoType,
    dimensions,
    weightKG,
    offeringPrice,
    numberOfLoads,
    pickUpDate,
    deliveryDate,
  } = req.body;
  const shipment = new Shipment({
    shipperId: req.user._id,
    origin,
    destination,
    cargoType,
    dimensions,
    weightKG,
    offeringPrice,
    numberOfLoads,
    pickUpDate,
    deliveryDate,
  });

  const createdShipment = await shipment.save();
  res.status(201).json(createdShipment);
});

// Get all shipments
const getAllShipments = asyncHandler(async (req, res) => {
  const shipments = await Shipment.find({});
  res.json(shipments);
});

// Get a single shipment by ID
const getShipmentById = asyncHandler(async (req, res) => {
  console.log("api called");
  const shipment = await Shipment.findById(req.params.id);

  if (shipment) {
    res.json(shipment);
  } else {
    res.status(404);
    throw new Error("Shipment not found");
  }
});

// Update a shipment
const updateShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);

  if (shipment) {
    shipment.origin = req.body.origin || shipment.origin;
    shipment.destination = req.body.destination || shipment.destination;
    shipment.cargoType = req.body.cargoType || shipment.cargoType;
    shipment.dimensions = req.body.dimensions || shipment.dimensions;
    shipment.weightKG = req.body.weightKG || shipment.weightKG;
    shipment.offeringPrice = req.body.offeringPrice || shipment.offeringPrice;
    shipment.numberOfLoads = req.body.numberOfLoads || shipment.numberOfLoads;
    shipment.pickUpDate = req.body.pickUpDate || shipment.pickUpDate;
    shipment.deliveryDate = req.body.deliveryDate || shipment.deliveryDate;
    // Assuming 'status' and 'bids' might be fields you want to update as well
    shipment.status = req.body.status || shipment.status;
    shipment.bids = req.body.bids || shipment.bids;

    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } else {
    res.status(404);
    throw new Error("Shipment not found");
  }
});

// Delete a shipment
const deleteShipment = asyncHandler(async (req, res) => {
  // findOneAndRemove to find by id and remove the document
  const shipment = await Shipment.deleteMany({ _id: req.params.id });

  if (shipment) {
    res.json({ message: "Shipment removed" });
  } else {
    res.status(404);
    throw new Error("Shipment not found");
  }
});
// Function for carriers to bid on a shipment
const bidOnShipment = asyncHandler(async (req, res) => {
  const { shipmentId, bidAmount, proposedTimeline } = req.body;
  const carrierId = req.user._id;
  const shipment = await Shipment.findById(shipmentId);

  if (!shipment) {
    res.status(404);
    throw new Error("Shipment not found");
  }

  const bid = {
    carrierId,
    bidAmount,
    proposedTimeline,
    status: "pending", // Default status
  };

  shipment.bids.push(bid);
  await shipment.save();

  //notification data
  const notificationData = {
    link: `shipment/${shipmentId}`,
    sender_id: carrierId,
    recipient_id: shipment.shipperId,
    title: `${req.user.firstName} has placed a bid on your shipment`,
  };
  //save notification into database

  const notification = new Notification({
    ...notificationData,
  });

  await notification.save();

  //sent notification to shiper for a new bid
  const io = getIO();
  const shipperSocket = userSockets.get(shipment.shipperId.toString());
  if (shipperSocket) {
    io.to(shipperSocket.id).emit("bidnotification", {
      message: `New bid on your shipment from ${req.user.firstName}`,
      bidDetails: bid,
    });
  } else {
    console.log("Shipper is not connected");
  }

  res.status(201).json({ message: "Bid placed successfully", bid });
});

// Function for carriers to view their bids
const viewMyBids = asyncHandler(async (req, res) => {
  const carrierId = req.user.id; // Assuming the user's ID is attached to the request

  const shipments = await Shipment.find({ "bids.carrierId": carrierId });
  const myBids = shipments.map((shipment) => {
    const bid = shipment.bids.find(
      (bid) => bid.carrierId.toString() === carrierId.toString()
    );
    return {
      shipmentId: shipment._id,
      origin: shipment.origin,
      destination: shipment.destination,
      bidAmount: bid.bidAmount,
      proposedTimeline: bid.proposedTimeline,
      status: bid.status,
    };
  });

  res.json(myBids);
});

const updateBidStatus = asyncHandler(async(req,res)=>{
  
  const {shipmentId,bidId,newStatus} = req.body

  if (!["pending", "accepted", "rejected"].includes(newStatus)) {
    res.status(400);
    throw new Error("Invalid status provided");
  }

  try {
   const shipment = await Shipment.findById(req.params.id)
   
   console.log(shipment);

    // Find the bid index in the bids array
    const bidIndex = shipment.bids.findIndex(bid => bid._id.toString() === bidId);
    console.log(bidIndex);
    

    shipment.bids[bidIndex].status = newStatus;
    
    if(newStatus==='accepted') {
      shipment.status = "in transit"
    }
    
    await shipment.save()
  res.status(200).json({
    message: "Bid status updated successfully",
    updatedShipment: shipment,
  });

  } catch (error) {
    console.log(error);
    
    res.status(500).json({message:"Internal server Error"})
  }

})

module.exports = {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
  bidOnShipment,
  viewMyBids,
  updateBidStatus
};
