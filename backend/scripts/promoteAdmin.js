require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-blockchain';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node promoteAdmin.js <email>');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    console.log(`Successfully promoted ${email} to admin!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
