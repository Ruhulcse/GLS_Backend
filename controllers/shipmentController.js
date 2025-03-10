const asyncHandler = require("express-async-handler");
const Shipment = require("../models/shipmentModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

const { getIO, userSockets } = require("../socket");

// Post a new shipment
const createShipment = asyncHandler(async (req, res) => {
  const {_id} = req.user
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

  const receiver = await User.find({$or:[{userType:"carrier"},{userType:"broker"}]});

  const createdShipment = await shipment.save();

receiver.forEach(async (user) => { 
  const notificationData = {
    link: `shipment/${createdShipment._id}`,
    sender_id: _id.toString(),
    recipient_id: user._id.toString(),
    title: `${req.user.firstName} has posted a new shipment`,
  };
  const notification = new Notification({notificationData,
  });
  await notification.save();
  const io = getIO();
  const userSocket = userSockets.get(user._id.toString());
  if(userSocket){
    io.to(userSocket.id).emit("newShipmentNotification", {
     message:`${req.user.firstName} has posted a new shipment`,
     notification,
    })
  }
  else {
    console.log("user socket not found");
    
  }
})
 
  res.status(201).json(createdShipment);
});

// Get all shipments
const getAllShipments = asyncHandler(async (req, res) => {
  const shipments = await Shipment.find({ status: "posted" });
  res.json(shipments);
});

// Get all shipments by Shipper Id
const getAllShipperShipments = asyncHandler(async (req, res) => {
  const shipments = await Shipment.find({ shipperId: req.params.id });
  console.log(shipments);

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

  if (shipment && shipment.bids.length == 0) {
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

const bidOnShipmentByBroker = asyncHandler(async (req, res) => {
  try {
    const { shipmentId, bidAmount, proposedTimeline, remarks, email } =
      req.body;
    const brokerId = req.user._id;
    const shipment = await Shipment.findById(shipmentId);
    const Carrier = await User.findOne({ email: email, userType: "carrier" ,userStatus:"Active"});

    if (!Carrier) {
      // res.status(404);
      // throw new Error("Carrier not found");
      res.status(404).json({ message: "Carrier not found" });
    }

    if (!shipment) {
      res.status(404);
      throw new Error("Shipment not found");
    } else {
      const bid = {
        brokerId,
        carrierId: Carrier._id,
        bidAmount,
        proposedTimeline,
        status: "assigned",
        remarks,
      };
      shipment.status = "assigned";
      shipment.bids.push(bid);
      await shipment.save();
      res.status(201).json({ message: "Bid placed successfully", bid });
      //notification data
      const shipperNotificationData = {
        link: `shipment/${shipmentId}`,
        sender_id: brokerId,
        recipient_id: shipment.shipperId,
        title: `${req.user.firstName} broker has placed a bid on your shipment to ${Carrier.firstName}`,
      };

      const carrierNotificationData = {
        link: `shipment/${shipmentId}`,
        sender_id: brokerId,
        recipient_id: Carrier._id,
        title: `${req.user.firstName} broker has assigned you to this shipment`,
      };

      const shipperNotification = new Notification(shipperNotificationData);

      const carrierNotification = new Notification(carrierNotificationData);

      await Promise.all([
        shipperNotification.save(),
        carrierNotification.save(),
      ]);

      const io = getIO();
      const shipperSocket = userSockets.get(shipment.shipperId.toString());
      if (shipperSocket) {
        io.to(shipperSocket.id).emit("assignByBroker", {
          message: `New bid on your shipment by broker ${req.user.firstName}`,
          bidDetails: bid,
        });
      } else {
        console.log("Shipper is not connected");
      }

      const carrierSocket = userSockets.get(Carrier._id.toString());
      if (carrierSocket) {
        io.to(carrierSocket.id).emit("assignedBidNotification", {
          message: `${req.user.firstName} broker has assigned you to this shipment`,
          bidDetails: bid,
        });
      } else {
        console.log("Carrier is not connected");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
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
      bidId: bid._id,
    };
  });

  res.json(myBids);
});

//function for broker assigning a carrier to a shipment
const viewAssigningCarrierByBroker = asyncHandler(async (req, res) => {
  const brokerId = req.user.id; // Assuming the user's ID is attached to the request

  const shipments = await Shipment.find({ "bids.brokerId": brokerId }).populate(
    {
      path: "bids.carrierId",
      select: "firstName lastName email",
    }
  );
  const myBids = shipments.map((shipment) => {
    // console.log("shipment",shipment);
    const bid = shipment.bids.find(
      (bid) => bid.brokerId == brokerId.toString()
    );
    return {
      shipmentId: shipment._id,
      origin: shipment.origin,
      destination: shipment.destination,
      bidAmount: bid.bidAmount,
      proposedTimeline: bid.proposedTimeline,
      status: bid.status,
      bidId: bid._id,
      carrierId: bid.carrierId,
    };
  });
  res.json(myBids);
});

// Function for Update bid status
const updateStatus = asyncHandler(async (req, res) => {
  const { bidId, newStatus } = req.body;

  if (!["pending", "accepted", "rejected", "delivered","assigned","in transit"].includes(newStatus)) {
    res.status(400);
    throw new Error("Invalid status provided");
  }

  try {
    const shipment = await Shipment.findById(req.params.id);
    console.log(shipment);
    

    // Find the bid index in the bids array
    const bidIndex = shipment.bids.findIndex(
      (bid) => bid._id.toString() === bidId
    );
    const shipmentUser = shipment.bids[bidIndex];

    if (newStatus === "accepted") {
      shipment.status = "accepted";
      shipment.bids[bidIndex].status = newStatus;
      await shipment.save();
      const notificationData = {
        link: `shipment/${shipmentUser._id}`,
        sender_id: shipment.shipperId,
        recipient_id: shipmentUser.carrierId,
        title: `Your bid on the shipment has been accepted by ${req.user.firstName}`,
      };
      const notification = new Notification({
        ...notificationData,
      });
      await notification.save();

      const io = getIO();
      const carrierSocket = userSockets.get(shipmentUser.carrierId.toString());
      if (carrierSocket) {
        io.to(carrierSocket.id).emit("acceptedBidNotification", {
          message: `Your bid on the shipment has been accepted by ${req.user.firstName}`,
          bidDetails: shipmentUser,
        });
      } else {
        console.log("Carrier is not connected");
      }
    } else if (newStatus === "delivered") {
      shipment.status = newStatus;
      shipment.bids[bidIndex].status = newStatus;
      await shipment.save();
      const notificationData = {
        link: `shipment/${shipmentUser._id}`,
        sender_id: shipmentUser.carrierId,
        recipient_id: shipment.shipperId,
        title: `${shipment.cargoType} shipment number of loads ${shipment.numberOfLoads} has been delivered by ${req.user.firstName}`,
      };
      const notification = new Notification({
        ...notificationData,
      });
      await notification.save();
      const io = getIO();
      const shipmentSocket = userSockets.get(shipment.shipperId.toString());
      if (shipmentSocket) {
        io.to(shipmentSocket.id).emit("deliveredBidNotification", {
          message: `${shipment.cargoType} shipment number of loads ${shipment.numberOfLoads} has been delivered by ${req.user.firstName}`,
          bidDetails: shipmentUser,
        });
      } else {
        console.log("Shipper is not connected");
      }
      if(shipment.bids[bidIndex].brokerId){
        const brokerId = shipment.bids[bidIndex].brokerId
        const brokerNotificationData = {
          link: `shipment/${shipmentUser._id}`,
          sender_id: shipmentUser.carrierId,
          recipient_id: brokerId,
          title: `${shipment.cargoType} shipment number of loads ${shipment.numberOfLoads} has been delivered by ${req.user.firstName}`,
        };
        const brokerNotification = new Notification({
          ...brokerNotificationData,
        });
        await brokerNotification.save();
        const brokerSocket = userSockets.get(brokerId.toString());
        if (brokerSocket) {
          io.to(brokerSocket.id).emit("deliveredBidNotificationToBroker", {
            message: `${shipment.cargoType} shipment number of loads ${shipment.numberOfLoads} has been delivered by ${req.user.firstName}`,
            bidDetails: shipmentUser,
        })
        }
      }

    } else if(newStatus === 'in transit'){
      
      shipment.bids[bidIndex].status = newStatus;
      shipment.status = newStatus;
      await shipment.save();

      const notificationData = {
        link: `shipment/${shipmentUser._id}`,
        sender_id: shipmentUser.carrierId,
        recipient_id: shipment.shipperId,
        title: `${shipment.cargoType} shipment number of loads ${shipment.numberOfLoads} has been picked up  by ${req.user.firstName}`,
      };
      const notification = new Notification({
        ...notificationData,
      });
      await notification.save();
      const io = getIO();
      const shipmentSocket = userSockets.get(shipment.shipperId.toString());
      if (shipmentSocket) {
        io.to(shipmentSocket.id).emit("pickedUpBidNotification", {
          message: `${shipment.cargoType} shipment number of loads ${shipment.numberOfLoads} has been picked up by ${req.user.firstName}`,
          bidDetails: shipmentUser,
        });
      } else {
        console.log("Shipper is not connected");
      }
      if(shipment.bids[bidIndex].brokerId){
        const brokerId = shipment.bids[bidIndex].brokerId
        const brokerNotificationData = {
          link: `shipment/${shipmentUser._id}`,
          sender_id: shipmentUser.carrierId,
          recipient_id: brokerId,
          title: `${shipment.cargoType} shipment number of loads ${shipment.numberOfLoads} has been picked up by ${req.user.firstName}`,
        };
        const brokerNotification = new Notification({
          ...brokerNotificationData,
        });
        await brokerNotification.save();
        const brokerSocket = userSockets.get(brokerId.toString());
        if (brokerSocket) {
          io.to(brokerSocket.id).emit("pickedUpBidNotificationToBroker", {
            message: `${shipment.cargoType} shipment number of loads ${shipment.numberOfLoads} has been picked up by ${req.user.firstName}`,
            bidDetails: shipmentUser,
        })
        }
      }

      
    }
     else if (newStatus === "rejected") {
      shipment.bids.splice(bidIndex, 1);
      await shipment.save();
    }

    res.status(200).json({
      message: "Bid status updated successfully",
      updatedShipment: shipment,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: "Internal server Error" });
  }
});

const getAssignBidsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  
  const shipment = await Shipment.findOne({ "bids._id": id }).populate({
    path: "bids.carrierId",
    select: "firstName lastName email",
  });
  const index = shipment.bids.findIndex((bid) => bid._id.toString() === id);
  //const specificBid = shipment.bids[index];
  res.json(shipment.bids[index]);
});

const updateAssignBids = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const user = await User.findOne({ email: email, userType: "carrier",userStatus:"Active" });
    if (!user) {
      // res.status(404);
      // throw new Error("Carrier not found");
      res.status(404).json({ message: "Carrier not found" });
    }
    const shipment = await Shipment.findOne({ "bids._id": id });

    const index = shipment.bids.findIndex((bid) => bid._id.toString() === id);
    
    const specificBid = shipment.bids[index];
    const brokerId = specificBid.brokerId;
    const perviousCarrierId = specificBid.carrierId;
    const currentCarrierId = user._id;

    if(shipment.status === "assigned" && specificBid.status === "assigned"){
    specificBid.carrierId = user._id || specificBid.carrierId;
    specificBid.bidAmount = req.body.bidAmount || specificBid.bidAmount;
    specificBid.proposedTimeline =
      req.body.proposedTimeline || specificBid.proposedTimeline;
    }

    await shipment.save();
    res.status(200).json(specificBid);
    if(perviousCarrierId !== currentCarrierId){
      const newCarrierNotificationData = {
        link: `shipment/${shipment._id}`,
        sender_id:brokerId,
        recipient_id: user._id,
        title: `${req.user.firstName} broker has assigned you to this shipment`,
      };
      const carrierNotification = new Notification(newCarrierNotificationData);
      const shipperNotificationData = {
        link: `shipment/${shipment._id}`,
        sender_id: brokerId,
        recipient_id: shipment.shipperId,
        title: `${req.user.firstName} broker changed careers on this shipment`,
      }

      const perviousCarrierNotification = await User.findById(perviousCarrierId);
      const oldCarrierNotificationData = {
        link: `/bids`,
        sender_id:brokerId,
        recipient_id: perviousCarrierId,
        title: `${req.user.firstName} broker has cancelled you to this shipment`,
      }
      const oldCarrierNotification = new Notification(oldCarrierNotificationData);

      const shipperNotification = new Notification(shipperNotificationData);
      await Promise.all([
        carrierNotification.save(),
        shipperNotification.save(),
        oldCarrierNotification.save()
      ])
      const io = getIO();
      const carrierSocket = userSockets.get(currentCarrierId.toString());
      if (carrierSocket) {
        io.to(carrierSocket.id).emit("assignedUpdateBidNotification", {
          message: `${req.user.firstName} broker has assigned you to this shipment`,
          bidDetails: specificBid,
        });
      } else {
        console.log("Carrier is not connected");
      }
      const shipperSocket = userSockets.get(shipment.shipperId.toString());
      if (shipperSocket) {
        io.to(shipperSocket.id).emit("assignedUpdateBidNotificationToShipper", {
          message: `${req.user.firstName} broker changed carriers on this shipment`,
          bidDetails: specificBid,
        });
      } else {
        console.log("Shipper is not connected");    
      
      }

      const perviousCarrierSocket = userSockets.get(perviousCarrierId.toString());
      if (perviousCarrierSocket) {
        io.to(perviousCarrierSocket.id).emit("cancelledBidNotification", {
          message: `${req.user.firstName} broker has cancelled you to this shipment`,
          bidDetails: specificBid,
        });
      } else {
        console.log("Pervious Carrier is not connected");    
      
      }
    
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Internal server Error" });
  }
});

module.exports = {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
  bidOnShipment,
  viewMyBids,
  updateStatus,
  getAllShipperShipments,
  bidOnShipmentByBroker,
  viewAssigningCarrierByBroker,
  getAssignBidsById,
  updateAssignBids,
};
