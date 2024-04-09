const express = require("express");
const router = express.Router();
const { protect, IsSupperadmin } = require("../middleware/auth");
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

// Route to handle creating a blog
router.route("/blogs/create").post(protect, IsSupperadmin, createBlog);

// Route to retrieve all blogs
router.route("/blogs").get(getAllBlogs);

// Routes to handle single blog by ID
router
  .route("/blogs/:id")
  .get(getBlogById)
  .put(protect, IsSupperadmin, updateBlog)
  .delete(protect, IsSupperadmin, deleteBlog);

module.exports = router;
