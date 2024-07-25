require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const auth = require("./middleware/auth");
const { failed } = require("./utils/response");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(helmet());

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
// Public Route
app.use("/api/auth", require("./routes/auth"));
// private route
app.use("/api/users", auth, require("./routes/users"));
app.use("/api/products", auth, require("./routes/products"));

// Route not found
app.use("*", (req, res) => {
  return failed(res, 404, "Route is not found");
});

// Connect Database and starting server
async function ServerStart() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (err) {
    console.log("Error in server start", err?.message);
  }
}

ServerStart();
