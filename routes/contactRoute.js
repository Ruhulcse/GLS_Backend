const express = require("express");
const {
  submitContactForm,
  getAllContact,
  getContactById,
  updateStatus,
  deleteMessage,
} = require("../controllers/contactController");
const { protect, IsSupperadmin } = require("../middleware/auth");
const router = express.Router();

router.post("/contact/send", submitContactForm);
router.route("/contacts").get(protect, IsSupperadmin, getAllContact);
router
  .route("/contact/:id")
  .get(protect, IsSupperadmin, getContactById)
  .put(protect, IsSupperadmin, updateStatus)
  .delete(protect, IsSupperadmin, deleteMessage);

module.exports = router;
