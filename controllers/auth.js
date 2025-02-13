const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const generateResetToken = require("../utils/generateResetToken");
const sendEmail = require("../utils/sentEmail");
const { generateUniqueCode } = require("../utils/generateCode");

//Login for Users
const Login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const userActivated = await User.findOne({ email, userStatus: "Active" });
  if (!userActivated) {
    return res.status(404).send(new Error("Account is not activated"));
  }

  if (user && (await user.matchPassword(password))) {
    res.json({
      message: "login success",
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
      userType: user.userType,
    });
  } else {
    res.status(401).send(new Error("invalid user name or password"));
  }
});

////Registration  for Users
const Registration = asyncHandler(async (req, res) => {
  const { email,userType,agent_code } = req.body;

  const userExists = await User.findOne({ email });

  console.log("user exist", userExists);

  if (userExists) {
    return res.status(202).send(new Error("user already exist"));
  }

  let newUser;

  const existingAgentCode = await User.findOne({ agent_code: agent_code ,userType:"agent"});

  const newAgentCode = userType === "agent" ? await generateUniqueCode() : null;
  if(newAgentCode){
    newUser = new User({
      email: req.body.email,
      password: req.body.password ? req.body.password : "123456",
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userType,
      agent_code: newAgentCode,
    });
  } else if(existingAgentCode && userType !== "agent" &&(existingAgentCode.agent_code === agent_code)){
    newUser = new User({
      email: req.body.email,
      password: req.body.password ? req.body.password : "123456",
      firstName: req.body.firstName,  
      lastName: req.body.lastName,
      userType,
      agent_code: agent_code,
    });
  } else {
    res.status(404).send(new Error("agent code not found"));
  }

  try {
    const createUser = await newUser.save();
    console.log(createUser);
    

    const message = `
    <html>
    <body>
      <p>Hi ${createUser.firstName},</p>
      <p> Welcome to GLS. Thank you for registering with us.</p>
    </body>
    </html>
    `

    await sendEmail({
      email: createUser.email,
      subject: "Registration Success",
      message,
    });

    res.json({
      message: "successfully registration",
      data: createUser,
    });
  } catch (error) {
    console.log(error);
  }
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  //console.log("user ", user);
  

  if (!user) {
    res.status(404).send(new Error("User not found"));
    return;
  }

  const { resetToken, resetTokenHash } = generateResetToken();

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword?token=${resetToken}`;
  console.log("reset url ", resetUrl);

  const message = `
    <html>
    <body>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href='${resetUrl}'>${resetUrl}</a></p>
    </body>
    </html>
  `;

  try {
   await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    console.log(error);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).send(new Error("Email could not be sent"));
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;

  const resetTokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).send(new Error("Invalid or expired token"));
    return;
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({ message: "Password reset successful" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find({ userType: { $ne: "agent" } });
    res.json({
      message: "successfully registration",
      data: allUsers,
    });
  } catch (error) {
    console.log(error);
  }
});

// Get single user by ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Update single user
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.email = req.body.email || user.email;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.address = req.body.address || user.address;
    user.postalCode = req.body.postalCode || user.postalCode;
    user.nid = req.body.nid || user.nid;
    user.passport = req.body.passport || user.passport;
    user.userType = req.body.userType || user.userType;
    user.agent_code = req.body.agent_code || user.agent_code;
    user.userStatus = req.body.userStatus || user.userStatus;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Delete single user
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

//get agent type user

const getAllAgentUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find({ userType: "agent" });
    res.json({
      message: "successfully get all agent user",
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
  getUserById,
  updateUser,
  deleteUser,
  getAllAgentUsers,
  forgotPassword,
  resetPassword,
};
