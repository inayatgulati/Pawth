const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const PostSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    caption: { type: String, required: true },
    petType: {
      type: String,
      enum: ["dog", "cat", "bird", "other"],
      required: true,
    },
    authorUsername: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
    likedBy: [{ type: String }], // usernames who liked
    savedBy: [{ type: String }], // usernames who saved
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", PostSchema);
