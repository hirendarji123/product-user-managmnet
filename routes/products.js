const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { check, validationResult } = require("express-validator");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const {
  defaultPage,
  validatePagination,
  defaultPageSize,
} = require("../utils/common");
const User = require("../models/User");
const { failed, succeeded } = require("../utils/response");
const {
  createProductController,
  getProductController,
  updateProductController,
  deleteProductController,
} = require("../controllers/product.controller");

router.get("/", validatePagination, getProductController);

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("sku", "SKU is required").not().isEmpty(),
    check("category", "Category is required").not().isEmpty(),
  ],
  createProductController
);

router.delete("/:id", deleteProductController);

const validateProduct = [
  check("name", "Name is required").not().isEmpty(),
  check("sku", "SKU is required").not().isEmpty(),
  check("category", "Category is required").not().isEmpty(),
];

router.patch(
  "/:id",
  auth,
  async (req, res, next) => {
    if (req.body.users === undefined) {
      await Promise.all(
        validateProduct.map((validation) => validation.run(req))
      );
    }
    next();
  },
  updateProductController
);

router.use("*", (req, res) => {
  return failed(res, 404, "Route is not found");
});

module.exports = router;
