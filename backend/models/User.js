const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    password: { type: String, required: true },
    displayName: { type: String, default: "" },
    profilePicUrl: { type: String, default: "" },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    suspended: { type: Boolean, default: false },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
