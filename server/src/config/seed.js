// ==============================================================================
// Database Seeder (server/src/config/seed.js)
// ==============================================================================
// Creates pre-configured demo accounts for:
// 1. Student (student@jklu.edu.in / Student@123)
// 2. Organisation (acm-student-chapter / Club@123)
// 3. Admin (admin@jklu.edu.in / Admin@123)

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User, Organisation } = require("../models");
const connectDB = require("./db");

const seedData = async () => {
  try {
    console.log("🌱 Starting Campus Pulse demo account seeder...\n");

    await connectDB();

    // ----------------------------------------------------------------------------
    // 1. Seed Demo Admin Account
    // ----------------------------------------------------------------------------
    const adminEmail = "admin@jklu.edu.in";
    let admin = await User.findOne({ email: adminEmail });

    const adminSalt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash("Admin@123", adminSalt);

    if (!admin) {
      admin = await User.create({
        name: "Campus Pulse Administrator",
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "admin",
        isActive: true
      });
      console.log("✅ Created Demo Admin Account");
    } else {
      admin.passwordHash = adminPasswordHash;
      await admin.save();
      console.log("✅ Verified / Updated Demo Admin Account");
    }

    // ----------------------------------------------------------------------------
    // 2. Seed Demo Student Account
    // ----------------------------------------------------------------------------
    const studentEmail = "student@jklu.edu.in";
    let student = await User.findOne({ email: studentEmail });

    const studentSalt = await bcrypt.genSalt(10);
    const studentPasswordHash = await bcrypt.hash("Student@123", studentSalt);

    if (!student) {
      student = await User.create({
        name: "Aarav Sharma",
        email: studentEmail,
        passwordHash: studentPasswordHash,
        role: "student",
        course: "BTech",
        enrollmentYear: 2023,
        passingOutYear: 2027,
        emailVerifiedAt: new Date(),
        isActive: true
      });
      console.log("✅ Created Demo Student Account");
    } else {
      student.passwordHash = studentPasswordHash;
      await student.save();
      console.log("✅ Verified / Updated Demo Student Account");
    }

    // ----------------------------------------------------------------------------
    // 3. Seed Demo Organisation Accounts
    // ----------------------------------------------------------------------------
    const orgSalt = await bcrypt.genSalt(10);
    const clubPasswordHash = await bcrypt.hash("Club@123", orgSalt);

    const demoOrgs = [
      {
        name: "ACM Student Chapter",
        organisationId: "acm-student-chapter",
        description: "Official Association for Computing Machinery student chapter fostering hackathons, coding workshops, and tech culture.",
        category: "Technical"
      },
      {
        name: "Rhythm Dance Society",
        organisationId: "dance-society",
        description: "Official campus cultural society celebrating classical and modern dance forms.",
        category: "Cultural"
      },
      {
        name: "JKLU Sports Club",
        organisationId: "sports-club",
        description: "Organizing intramural sports leagues, tournaments, and fitness events.",
        category: "Sports"
      }
    ];

    for (const orgData of demoOrgs) {
      let org = await Organisation.findOne({ organisationId: orgData.organisationId });
      if (!org) {
        org = await Organisation.create({
          ...orgData,
          passwordHash: clubPasswordHash,
          mustChangePassword: false,
          isActive: true
        });
        console.log(`✅ Created Demo Organisation: ${org.name} (${org.organisationId})`);
      } else {
        org.passwordHash = clubPasswordHash;
        org.mustChangePassword = false;
        await org.save();
        console.log(`✅ Verified / Updated Demo Organisation: ${org.name} (${org.organisationId})`);
      }
    }

    console.log("\n========================================================");
    console.log("🎓 CAMPUS PULSE DEMO CREDENTIALS READY FOR TESTING");
    console.log("========================================================");
    console.log("1. STUDENT ACCOUNT:");
    console.log("   Portal:   http://localhost:5173/student/login");
    console.log("   Email:    student@jklu.edu.in");
    console.log("   Password: Student@123");
    console.log("--------------------------------------------------------");
    console.log("2. ORGANISATION ACCOUNT:");
    console.log("   Portal:   http://localhost:5173/organisation/login");
    console.log("   ID:       acm-student-chapter");
    console.log("   Password: Club@123");
    console.log("--------------------------------------------------------");
    console.log("3. ADMIN ACCOUNT:");
    console.log("   Portal:   http://localhost:5173/admin/login");
    console.log("   Email:    admin@jklu.edu.in");
    console.log("   Password: Admin@123");
    console.log("========================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedData();
