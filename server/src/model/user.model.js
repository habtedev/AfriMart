const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function () {
  console.log('Pre-save hook triggered for user:', this.email);
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hash.');
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
  console.log('Password hashed for user:', this.email);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
