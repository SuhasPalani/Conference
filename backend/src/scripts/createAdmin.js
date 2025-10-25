require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../src/models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Get admin details
    const email = await question('Admin email: ');
    const fullName = await question('Admin full name: ');
    const password = await question('Admin password (min 6 characters): ');

    // Validate input
    if (!email || !fullName || !password) {
      console.log('❌ All fields are required');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User with this email already exists');
      process.exit(1);
    }

    // Create admin user
    const adminUser = await User.create({
      email,
      fullName,
      password,
      roles: ['basic', 'admin'],
      isVerified: true
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\nAdmin Details:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Name: ${adminUser.fullName}`);
    console.log(`Roles: ${adminUser.roles.join(', ')}`);
    console.log(`\nYou can now login with these credentials.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();