const express = require("express");
const router = express.Router();
const {
  Login,
  Registration,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/auth");

router.route("/register").post(Registration);
router.route("/login").post(Login);
router.route("/users").get(getAllUsers);
router.route("/user/:id").get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;
