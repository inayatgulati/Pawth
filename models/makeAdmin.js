require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const ADMINS = ["Inayatinayat", "ShinThant"]; // Our names as the admins of the app

async function makeAdmins() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const username of ADMINS) {
    const user = await User.findOneAndUpdate(
      { username },
      { $set: { role: "admin" } },
      { new: true },
    );
    if (user) console.log(`✅ ${username} is now admin`);
    else console.log(`❌ User "${username}" not found`);
  }

  await mongoose.disconnect();
  process.exit();
}

makeAdmins();
