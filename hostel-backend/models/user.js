

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['student', 'warden'], default: 'student' },

    // ── Email Verification ──────────────────────────────
    isVerified:      { type: Boolean, default: false },
    verifyOtp:       { type: String,  default: null },
    verifyOtpExpiry: { type: Date,    default: null },

    // ── Password Reset ──────────────────────────────────
    resetOtp:        { type: String,  default: null },
    resetOtpExpiry:  { type: Date,    default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);