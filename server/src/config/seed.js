// ==============================================================================
// Database Seeder (server/src/config/seed.js)
// ==============================================================================
// Seeds initial Admin account and sample Student Organisations into MongoDB Atlas.
// Per Section 7 of the Blueprint:
// - Initial Admin account is created directly in the database (no public self-registration).
// - Organisations are provisioned with an organisationId and temporary password.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User, Organisation } = require("../models");
const connectDB = require("./db");

const seedData = async () => {
  try {
    console.log("🌱 Starting Campus Pulse database seeder...");

    await connectDB();

    // ----------------------------------------------------------------------------
    // 1. Seed Initial Admin Account
    // ----------------------------------------------------------------------------
    const adminEmail = "admin@jklu.edu.in";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminSalt = await bcrypt.genSalt(10);
      const adminPasswordHash = await bcrypt.hash("Admin@123", adminSalt);

      await User.create({
        name: "Campus Pulse Administrator",
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "admin",
        isActive: true
      });

      console.log("✅ Seeded Admin Account:");
      console.log(`   Email:    ${adminEmail}`);
      console.log(`   Password: Admin@123`);
    } else {
      console.log(`ℹ️ Admin account (${adminEmail}) already exists. Skipping.`);
    }

    // ----------------------------------------------------------------------------
    // 2. Seed Initial Sample Organisations
    // ----------------------------------------------------------------------------
    const sampleOrgs = [
      {
        name: "ACM Student Chapter",
        organisationId: "acm-student-chapter",
        description: "Association for Computing Machinery student chapter fostering technical excellence, hackathons, and coding culture.",
        category: "Technical"
      },
      {
        name: "Rhythm Dance Society",
        organisationId: "dance-society",
        description: "Official campus dance society for classical, western, and contemporary performances.",
        category: "Cultural"
      },
      {
        name: "JKLU Sports Club",
        organisationId: "sports-club",
        description: "Coordinating inter-college tournaments, cricket, football, basketball, and campus sports fests.",
        category: "Sports"
      }
    ];

    const tempPassword = "tempPassword123";
    const orgSalt = await bcrypt.genSalt(10);
    const orgPasswordHash = await bcrypt.hash(tempPassword, orgSalt);

    for (const org of sampleOrgs) {
      const existingOrg = await Organisation.findOne({ organisationId: org.organisationId });
      if (!existingOrg) {
        await Organisation.create({
          ...org,
          passwordHash: orgPasswordHash,
          mustChangePassword: true, // Forces representative to change password on first login
          isActive: true
        });
        console.log(`✅ Seeded Organisation: ${org.name}`);
        console.log(`   ID:       ${org.organisationId}`);
        console.log(`   Password: ${tempPassword}`);
      } else {
        console.log(`ℹ️ Organisation (${org.organisationId}) already exists. Skipping.`);
      }
    }

    console.log("\n🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedData();
