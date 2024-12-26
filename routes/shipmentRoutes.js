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
  updateBidStatus,
  updateDelivery,
  getAllShipperShipments,
} = require("../controllers/shipmentController");
const { protect, isShipper, isCarrier } = require("../middleware/auth");

router.use("/shipments", protect);

router.get("/shipments/mybids", protect, viewMyBids);
router.route("/shipments").post(isShipper, createShipment).get(getAllShipments);
router
  .route("/shipments/:id")
  .get(getShipmentById)
  .put(updateShipment)
  .delete(deleteShipment);
router.route('/shipper/:id').get(protect,getAllShipperShipments)

router.route("/shipments/bid-status/:id").put(protect,updateBidStatus)

router.route("/shipments/delivery/:id").put(updateDelivery)

router.post("/shipments/bid", isCarrier, bidOnShipment);

module.exports = router;
