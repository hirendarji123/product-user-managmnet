const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Product = require("../models/Product");
const { defaultPage, defaultPageSize } = require("../utils/common");
const User = require("../models/User");
const { failed, succeeded } = require("../utils/response");

exports.createProductController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return failed(res, 400, errors.array()[0]["msg"]);
    }

    const { name, sku, description, category, logo, users } = req.body;
    const { id: userId, role } = req.user;

    let product = await Product.findOne({ sku }).exec();
    if (product) {
      return failed(res, 400, "Product with this SKU already exists");
    }

    //check all user available or not
    if (role == "admin") {
      const userIds = users.map((item) => {
        return new mongoose.Types.ObjectId(item);
      });
      const usersList = await User.find(
        { _id: { $in: userIds } },
        { _id: 1 }
      ).exec();
      if (usersList.length !== users.length) {
        return failed(res, 400, "Please provide valid userIds");
      }
    }
    product = new Product({
      name,
      sku,
      description,
      category,
      logo,
      source: role,
      users: role != "admin" ? [userId] : users || [],
    });

    await product.save();
    return succeeded(res, 200, "Product created successfully");
  } catch (err) {
    console.error(err.message);
    return failed(res, 500, "Internal Server error");
  }
};

exports.getProductController = async (req, res) => {
  try {
    const {
      page = defaultPage,
      pageSize = defaultPageSize,
      search,
      category,
      source,
    } = req.query;
    const { id: userId } = req.user;
    const skip = (page - 1) * pageSize;
    let allCategories = [];

    // Build the query object based on search and filter criteria
    let query = req.user.role === "admin" ? {} : { users: { $in: [userId] } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (source) {
      query.source = source;
    }

    const totalCount = await Product.countDocuments(query);
    allCategories = await Product.distinct("category").exec();
    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(pageSize))
      .exec();
    if (products && products.length > 0) {
      products.map((item) => {
        if (!allCategories.includes(item.category)) {
          allCategories.push(item.category);
        }
      });
    }
    return succeeded(res, 200, "Product fetched successfully", {
      totalCount,
      products,
      allCategories,
    });
  } catch (err) {
    console.error(err.message);
    return failed(res, 500, "Internal Server error");
  }
};

exports.updateProductController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return failed(res, 400, errors.array()[0].msg);
    }

    const { name, sku, description, category, logo, users } = req.body;
    const { id: userId, role } = req.user;

    if (role !== "admin") {
      return failed(res, 403, "Access denied");
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return failed(res, 400, "Product not found");
    }

    // Check if the SKU is being changed to an existing SKU
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return failed(res, 400, "Product with this SKU already exists");
      }
    }

    // Check if all provided user IDs are valid
    if (users) {
      const userIds = users.map((item) => new mongoose.Types.ObjectId(item));
      const usersList = await User.find({ _id: { $in: userIds } }, { _id: 1 });
      if (usersList.length !== users.length) {
        return failed(res, 400, "Please provide valid user IDs");
      }
    }

    // Update product fields
    if (users && users.length > 0) {
      product.users = users;
    } else {
      product.name = name || product.name;
      product.sku = sku || product.sku;
      product.description = description || product.description;
      product.category = category || product.category;
      product.logo = logo || product.logo;
    }
    await product.save();
    return succeeded(res, 200, "Product updated successfully");
  } catch (err) {
    console.error(err.message);
    return failed(res, 500, "Internal Server error");
  }
};

exports.deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (role !== "admin") {
      return failed(res, 403, "Access denied");
    }
    const product = await Product.findByIdAndDelete({ _id: id }).exec();

    if (product) {
      return succeeded(res, 200, "Product deleted successfully");
    } else {
      return failed(res, 400, "Product not found");
    }
  } catch (err) {
    console.error(err.message);
    return failed(res, 500, "Internal Server error");
  }
};
