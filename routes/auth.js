const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { loginController } = require("../controllers/auth.controller");
const { failed } = require("../utils/response");

// login route
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  loginController
);

router.use("*", (req, res) => {
  return failed(res, 404, "Route is not found");
});
module.exports = router;
