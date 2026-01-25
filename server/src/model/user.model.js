const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  googleId: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  emailVerificationOtp: { type: String },
  emailVerificationOtpExpires: { type: Date },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
