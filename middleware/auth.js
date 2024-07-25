require("dotenv").config();
const jwt = require("jsonwebtoken");
const { failed } = require("../utils/response");

module.exports = function (req, res, next) {
  const header = req.header("authorization");
  if (!header) {
    return failed(res, 401, "Please provide authorization in header");
  }
  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded.user;

    next();
  } catch (err) {
    return failed(res, 401, "Invalid Token");
  }
};
