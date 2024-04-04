const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    postalCode: {
      type: String,
      required: false,
      trim: true,
    },
    nid: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    passport: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    agent_code: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    userType: {
      type: String,
      required: true,
      enum: [
        "supperadmin",
        "admin",
        "user",
        "guest",
        "carrier",
        "shipper",
        "broker",
        "agent",
      ],
      default: "user",
    },
    userStatus: {
      type: String,
      required: true,
      enum: [
        "Pending",
        "Active",
        "Deactivated",
        "Suspended",
        "Rejected",
        "Blocked",
      ],
      default: "Pending",
    },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
module.exports = User;
