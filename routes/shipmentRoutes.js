const express = require("express");
const {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
  bidOnShipment,
  viewMyBids,
} = require("../controllers/shipmentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/shipments").post(createShipment).get(getAllShipments);
router
  .route("/shipments/:id")
  .get(getShipmentById)
  .put(updateShipment)
  .delete(deleteShipment);

router.post("/shipments/bid", bidOnShipment);
router.get("/shipments/mybids", viewMyBids);

module.exports = router;
