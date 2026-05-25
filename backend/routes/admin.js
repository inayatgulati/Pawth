const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const verifyToken = require("../middleware/auth");

// ── Middleware: must be logged in AND be an admin
function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

// ── Users
// GET all users (excluding passwords)
router.get("/users", verifyToken, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle suspend/unsuspend a user
router.patch("/users/:id/suspend", verifyToken, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "admin")
      return res.status(400).json({ error: "Cannot suspend an admin." });

    user.suspended = !user.suspended;
    await user.save();
    res.json({ suspended: user.suspended, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a user (and their posts)
router.delete("/users/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "admin")
      return res.status(400).json({ error: "Cannot delete an admin." });

    // Remove all posts by this user
    await Post.deleteMany({ authorUsername: user.username });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: `User @${user.username} and their posts deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Posts

// GET all posts (admin view)
router.get("/posts", verifyToken, adminOnly, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE any post
router.delete("/posts/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
