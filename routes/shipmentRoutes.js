const express = require("express");
const {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
} = require("../controllers/shipmentController");

const router = express.Router();

router.route("/shipments").post(createShipment).get(getAllShipments);
router
  .route("/shipments/:id")
  .get(getShipmentById)
  .put(updateShipment)
  .delete(deleteShipment);

module.exports = router;
