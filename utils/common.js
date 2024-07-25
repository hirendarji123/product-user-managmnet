const { query, validationResult } = require("express-validator");
const { failed } = require("./response");

exports.defaultPageSize = 10;
exports.defaultPage = 1;

exports.validatePagination = [
  query("pageSize")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("PageSize must be a positive integer"),
  query("page")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Page must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return failed(res, 400, "User already exists");
    }
    next();
  },
];
