require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const ADMIN_EMAIL = "jayeshnikunj31@gmail.com";

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // ── Create local test account ──────────────────────────────────
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

    // ── Promote admin account ──────────────────────────────────────
    const adminResult = await User.updateOne(
        { email: ADMIN_EMAIL },
        { $set: { isAdmin: true } }
    );
    if (adminResult.matchedCount > 0) {
        console.log(`✅ Admin promoted: ${ADMIN_EMAIL}`);
    } else {
        console.log(`ℹ️  Admin account not found yet (${ADMIN_EMAIL}) — sign in via Google first, then run seed again.`);
    }

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
});
