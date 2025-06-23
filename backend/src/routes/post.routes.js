const express = require("express");
const router = express.Router();
// Currently you only imported createPost and getAllPosts
const {
  createPost,
  getAllPosts,
  updatePost, // 👈 Add this
  getUserPosts,
  deletePost, // 👈 Add this
} = require("../controllers/post.controller");

const requireAuth = require("../middlewares/auth.middleware");
const multer = require("multer");
const upload = multer({ dest: "src/uploads/temp", limits: { files: 3 } });

router.post("/", requireAuth, upload.array("images", 3), createPost);
router.get("/", requireAuth, getAllPosts);
router.get("/user/:id", requireAuth, getUserPosts);

router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);

module.exports = router;
