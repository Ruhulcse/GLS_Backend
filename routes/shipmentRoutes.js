const express = require("express");
const router = express.Router();
const {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
  bidOnShipment,
  viewMyBids,
  getAllShipperShipments,
  updateStatus,
  bidOnShipmentByBroker,
  viewAssigningCarrierByBroker,
  getAssignBidsById,
  updateAssignBids,
} = require("../controllers/shipmentController");
const {
  protect,
  isShipper,
  isCarrier,
  isBroker,
} = require("../middleware/auth");

router.use("/shipments", protect);

router.get("/shipments/mybids", protect, viewMyBids);
router.route("/shipments").post(isShipper, createShipment).get(getAllShipments);
router
  .route("/shipments/:id")
  .get(getShipmentById)
  .put(updateShipment)
  .delete(deleteShipment);
router.route("/shipper/:id").get(protect, getAllShipperShipments);

router.route("/shipments/status/:id").put(protect, updateStatus);

router.post("/shipments/bid", isCarrier, bidOnShipment);
router.post("/shipments/broker/bid", isBroker, bidOnShipmentByBroker);
router.get(
  "/shipments/assigned/broker",
  isBroker,
  viewAssigningCarrierByBroker
);
router
  .route("/shipment/bids/:id")
  .get(protect, getAssignBidsById)
  .put(protect, updateAssignBids);

module.exports = router;
