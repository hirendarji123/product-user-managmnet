const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const { succeeded, failed } = require("../utils/response");

exports.loginController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return failed(res, 400, errors.array()[0]["msg"]);
    }

    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return failed(res, 400, "Invalid Credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return failed(res, 400, "Invalid Credentials");
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_KEY,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        return succeeded(res, 200, "User logged successfully.", { token });
      }
    );
  } catch (err) {
    console.error(err?.message);
    return failed(res, 500, "Internal Server error");
  }
};
