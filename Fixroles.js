require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function fixRoles() {
  await mongoose.connect(process.env.MONGO_URI);

  const result = await User.updateMany(
    { role: "user" }, // find all legacy "user" roles
    { $set: { role: "member" } }, // standardize to "member"
  );

  console.log(
    ` Updated ${result.modifiedCount} user(s) from role "user" → "member"`,
  );
  await mongoose.disconnect();
  process.exit();
}

fixRoles();
