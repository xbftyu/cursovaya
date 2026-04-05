require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./connectDB");
const { errorHandler } = require("./middleware/errorMiddleware");
const seedCategories = require("./utils/seed");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const adminRoutes = require("./routes/admin");
const categoryRoutes = require("./routes/categories");
const userRoutes = require("./routes/user");
const uploadRoutes = require("./routes/uploadRoutes");
const path = require("path");

const app = express();

// Connect to MongoDB
connectDB().then(() => {
  // Seed Categories if empty
  seedCategories();
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

// Static folder for file uploads
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.get("/", (req, res) => {
  res.send("API running");
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});