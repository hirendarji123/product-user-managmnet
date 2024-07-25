const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const { failed, succeeded } = require("../utils/response");

exports.createUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return failed(res, 400, errors.array()[0]["msg"]);
  }

  if (req.user.role !== "admin") {
    return failed(res, 403, "Access denied");
  }

  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return failed(res, 400, "User already exists");
    }

    user = new User({
      name,
      email,
      password,
      role: role || "user",
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    return succeeded(res, 200, "User registered successfully");
  } catch (err) {
    console.error(err.message);
    return failed(res, 500, "Internal Server error");
  }
};

exports.getAllUserController = async (req, res) => {
  if (req.user.role !== "admin") {
    return failed(res, 403, "Access denied");
  }
  const { allDetails } = req.query;
  try {
    let user = await User.find(
      {},
      allDetails ? { password: 0 } : { _id: 1, name: 1 }
    ).exec();
    if (user) {
      return succeeded(res, 200, "User fetched successfully", user);
    } else {
      return failed(res, 400, "User not found.");
    }
  } catch (err) {
    console.error(err.message);
    return failed(res, 500, "Internal Server error");
  }
};
