const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");
const multer = require("multer");

// Multer — store file in memory so we can save it as base64 in MongoDB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// GET all posts (public) — supports ?petType=dog&q=keyword
router.get("/", async (req, res) => {
  try {
    const { petType, q } = req.query;
    const filter = {};
    if (petType) filter.petType = petType;
    if (q) {
      filter.$or = [
        { caption: { $regex: q, $options: "i" } },
        { authorUsername: { $regex: q, $options: "i" } },
      ];
    }
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single post by ID (public — needed for detail view)
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create post (protected)
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      // File uploaded — convert buffer to base64 data URL for storage
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    } else if (req.body.imageUrl) {
      // Manual URL pasted by the user
      imageUrl = req.body.imageUrl;
    } else {
      return res
        .status(400)
        .json({ message: "An image or image URL is required." });
    }

    const post = new Post({
      imageUrl,
      caption: req.body.caption,
      petType: req.body.petType,
      authorUsername: req.user.username,
    });

    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST like/unlike a post (protected)
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const username = req.user.username;
    const alreadyLiked = post.likedBy.includes(username);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((u) => u !== username);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likedBy.push(username);
      post.likesCount += 1;
    }
    await post.save();
    res.json({ likesCount: post.likesCount, likedBy: post.likedBy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST save/unsave a post (protected)
router.post("/:id/save", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const username = req.user.username;
    const user = await User.findById(req.user.id);
    const alreadySaved = post.savedBy.includes(username);
    if (alreadySaved) {
      post.savedBy = post.savedBy.filter((u) => u !== username);
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== req.params.id,
      );
    } else {
      post.savedBy.push(username);
      user.savedPosts.push(post._id);
    }
    await post.save();
    await user.save();
    res.json({ savedBy: post.savedBy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add comment (protected)
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({ username: req.user.username, text: req.body.text });
    await post.save();
    res.status(201).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE own post (protected — owner or admin)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (
      post.authorUsername !== req.user.username &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    // Only the author can edit their post
    if (post.authorUsername !== req.user.username) {
      return res
        .status(403)
        .json({ message: "You can only edit your own posts." });
    }

    const { caption, imageUrl, petType } = req.body;

    if (caption !== undefined) post.caption = caption.trim();
    if (imageUrl !== undefined) post.imageUrl = imageUrl.trim();
    if (petType !== undefined) post.petType = petType;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
