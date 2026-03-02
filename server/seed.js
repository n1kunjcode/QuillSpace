require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const EMAIL = "nik@test.com";
    const existing = await User.findOne({ email: EMAIL });

    if (existing) {
        console.log("Test user already exists — skipping creation");
    } else {
        const hashed = await bcrypt.hash("123456", 12);
        await User.create({
            name: "Nik",
            email: EMAIL,
            password: hashed,
            authProvider: "local",
        });
        console.log("✅ Test user created: nik@test.com / 123456");
    }

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
});
