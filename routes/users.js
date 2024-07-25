const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { failed } = require("../utils/response");
const {
  createUserController,
  getAllUserController,
} = require("../controllers/users.controller");

// create new user by admin
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  createUserController
);

router.get("/getAllUser", getAllUserController);

router.use("*", (req, res) => {
  return failed(res, 404, "Route is not found");
});
module.exports = router;
