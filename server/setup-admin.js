const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Product = require('./src/models/Product');

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory-db');
    console.log('✅ Connected to MongoDB');

    // Check existing users
    const existingUsers = await User.find();
    console.log(`\n📊 Existing users: ${existingUsers.length}`);
    existingUsers.forEach(u => console.log(`  - ${u.username} (role: ${u.role})`));

    // Create admin user if not exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('\n✅ Admin user created!');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Role: admin');
    } else {
      console.log('\n✅ Admin user already exists');
      console.log('   Username:', adminExists.username);
      console.log('   Role:', adminExists.role);
    }

    // Check products
    const products = await Product.find();
    console.log(`\n📦 Total products in database: ${products.length}`);

    // Create sample product if none exist
    if (products.length === 0) {
      await Product.create({
        name: 'Sample Laptop',
        sku: 'LAPTOP-001',
        category: 'Electronics',
        price: 999.99,
        quantity: 50,
        description: 'High-performance laptop for work and gaming',
        imageUrl: 'https://via.placeholder.com/300'
      });
      console.log('✅ Sample product created');
    }

    await mongoose.disconnect();
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();
