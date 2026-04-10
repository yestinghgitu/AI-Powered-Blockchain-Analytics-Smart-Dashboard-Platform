const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_dashboard';
  const adminEmail = process.argv[2] || 'admin@nexus.ai';
  const adminPassword = process.argv[3] || 'admin123';

  try {
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`[Seed] Admin user ${adminEmail} already exists. Skipping.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('--------------------------------------------------');
    console.log('SUCCESS: Admin user created successfully!');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('--------------------------------------------------');
    console.log('IMPORTANT: Please change this password after login.');
    
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
