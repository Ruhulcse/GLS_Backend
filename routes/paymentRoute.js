const express = require("express");
const { createStripeSession } = require("../controllers/paymentController");
const router = express.Router();

router.post("/create_subscription", createStripeSession);

module.exports = router;
