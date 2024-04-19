const express = require("express");
const { protect, IsSupperadmin } = require("../middleware/auth");
const {
  createGuide,
  getAllGuide,
  getGuideById,
  updateGuide,
  deleteGuide,
} = require("../controllers/guideController");
const router = express.Router();

router.route("/guide/create").post(protect, IsSupperadmin, createGuide);

router.route("/guides").get(getAllGuide);

router
  .route("/guide/:id")
  .get(getGuideById)
  .put(protect, IsSupperadmin, updateGuide)
  .delete(protect, IsSupperadmin, deleteGuide);

module.exports = router;
