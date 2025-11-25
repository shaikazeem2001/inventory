const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

const promoteToAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Update to admin role
    adminUser.role = 'admin';
    await adminUser.save();

    console.log('✅ Admin user promoted!');
    console.log('   Username:', adminUser.username);
    console.log('   Role:', adminUser.role);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

promoteToAdmin();
