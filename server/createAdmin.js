// Script to create an admin user in the database
// Usage: node createAdmin.js

const mongoose = require('mongoose');
const User = require('./src/model/user.model');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'habtamudev@gmail.com'; // Change as needed
  const password = 'Habte1435691'; // Change as needed
  const name = 'Admin User';

  let user = await User.findOne({ email });
  if (user) {
    user.role = 'admin';
    user.password = password; // Will be hashed by pre-save hook
    await user.save();
    console.log('Existing user updated to admin:', email);
  } else {
    user = await User.create({ name, email, password, role: 'admin' });
    console.log('New admin user created:', email);
  }
  mongoose.disconnect();
}

createAdmin().catch(err => {
  console.error('Error creating admin:', err);
  mongoose.disconnect();
});
