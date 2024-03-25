const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

//Login for Users
const Login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      message: "login success",
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(202).send(new Error("invalid user name or password"));
  }
});

////Registration  for Users
const Registration = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const userExists = await User.findOne({ email });

  console.log("user exist", userExists);

  if (userExists) {
    res.status(202).send(new Error("user already exist"));
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });

  try {
    const createUser = await user.save();
    res.json({
      message: "successfully registration",
      data: createUser,
    });
  } catch (error) {
    console.log(error);
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.json({
      message: "successfully registration",
      data: allUsers,
    });
  } catch (error) {
    console.log(error);
  }
});
module.exports = {
  Login,
  Registration,
  getAllUsers,
};
