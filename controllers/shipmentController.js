const asyncHandler = require("express-async-handler");
const Shipment = require("../models/shipmentModel");

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
  const shipment = await Shipment.findById(req.params.id);

  if (shipment) {
    await shipment.remove();
    res.json({ message: "Shipment removed" });
  } else {
    res.status(404);
    throw new Error("Shipment not found");
  }
});

module.exports = {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
};
