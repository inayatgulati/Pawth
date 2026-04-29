require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const postRoutes = require("./routes/posts");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

const Post = require("./models/Post");
const demoPosts = require("./seeds/postsSeed");

const app = express();
const PORT = process.env.PORT || 5002;

const aiRoutes = require("./routes/Aievents");

const apiKey = process.env.ANTHROPIC_API_KEY;
console.log(apiKey);

app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

// Database connection
const uri = process.env.MONGO_URI;
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

async function connectDB() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("✅ Connected to MongoDB!");

    const count = await Post.countDocuments();
    if (count === 0) {
      await Post.insertMany(shuffle(demoPosts));
      console.log("Posts seeded with shuffled order!");
    } else {
      console.log(`${count} posts already in DB, skipping seed.`);
    }
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
