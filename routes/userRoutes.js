const express = require("express");
const router = express.Router();
const { Login, Registration, getAllUsers } = require("../controllers/auth");

router.route("/register").post(Registration);
router.route("/login").post(Login);
router.route("/users").get(getAllUsers);

module.exports = router;
