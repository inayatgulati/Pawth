const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const verifyToken = require("../middleware/auth");

// GET /api/users/profile — returns logged-in user's profile + posts + saved posts
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("savedPosts");
    const myPosts = await Post.find({ authorUsername: req.user.username }).sort(
      { createdAt: -1 },
    );

    res.json({
      username: user.username,
      email: user.email || "",
      displayName: user.displayName || "",
      profilePicUrl: user.profilePicUrl || "",
      role: user.role,
      myPosts,
      savedPosts: user.savedPosts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile — update display name and profile picture
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { displayName, profilePicUrl } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(displayName !== undefined && { displayName }),
        ...(profilePicUrl !== undefined && { profilePicUrl }),
      },
      { new: true, select: "-password" },
    );

    res.json({
      username: updated.username,
      email: updated.email || "",
      displayName: updated.displayName || "",
      profilePicUrl: updated.profilePicUrl || "",
      role: updated.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
