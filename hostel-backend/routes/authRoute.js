const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User    = require('../models/user');

// ════════════════════════════════════════════════════════
// MAILTRAP TRANSPORTER
// ════════════════════════════════════════════════════════
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// ════════════════════════════════════════════════════════
// ALLOWED EMAIL DOMAINS
// ════════════════════════════════════════════════════════
const ALLOWED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.in',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'rediffmail.com',
];

const isAllowedEmail = (email) => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
};

const getDomainError = (email) => {
  const domain = email.split('@')[1];
  return `"${domain}" is not allowed. Use Gmail, Yahoo, Outlook, etc.`;
};

// ════════════════════════════════════════════════════════
// SEND OTP EMAIL
// ════════════════════════════════════════════════════════
const sendOtpEmail = async (toEmail, otp, purpose) => {
  console.log(`\n📧 OTP for ${toEmail} (${purpose}): ${otp}\n`);

  await transporter.sendMail({
    from: '"Hostel Management" <hostel@mailtrap.io>',
    to: toEmail,
    subject: `Hostel Management - ${purpose} OTP`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;
                  padding:32px;border-radius:16px;border:1px solid #e5e7eb;">
        <h2 style="color:#4f46e5;">🏠 Hostel Management</h2>
        <p style="color:#374151;">Your OTP for <strong>${purpose}</strong>:</p>
        <div style="font-size:40px;font-weight:900;letter-spacing:12px;
                    color:#4f46e5;margin:24px 0;text-align:center;
                    background:#eef2ff;padding:16px;border-radius:12px;">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:13px;text-align:center;">
          ⏱ Valid for <strong>10 minutes</strong>. Do not share this with anyone.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
        <p style="color:#9ca3af;font-size:12px;text-align:center;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  });
};

// ════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════
const generateOtp = () =>
  process.env.NODE_ENV !== 'production'
    ? '123456'
    : Math.floor(100000 + Math.random() * 900000).toString();

const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);


// ════════════════════════════════════════════════════════
// REGISTER
// POST /api/auth/register
// ════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!isAllowedEmail(email))
      return res.status(400).json({ message: getDomainError(email) });

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified)
      return res.status(400).json({ message: 'Email already registered. Please login.' });

    const otp    = generateOtp();
    const expiry = otpExpiry();
    const hashed = await bcrypt.hash(password, 10);

    if (existing && !existing.isVerified) {
      existing.name            = name;
      existing.password        = hashed;
      existing.role            = role;
      existing.verifyOtp       = otp;
      existing.verifyOtpExpiry = expiry;
      await existing.save();
    } else {
      await User.create({
        name, email, password: hashed, role,
        isVerified:      false,
        verifyOtp:       otp,
        verifyOtpExpiry: expiry,
      });
    }

    await sendOtpEmail(email, otp, 'Email Verification');
    res.status(201).json({ message: 'OTP sent to your email. Please verify.' });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ════════════════════════════════════════════════════════
// VERIFY EMAIL
// POST /api/auth/verify-email
// ════════════════════════════════════════════════════════
router.post('/verify-email', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found.' });
    if (user.isVerified)
      return res.status(400).json({ message: 'Email already verified. Please login.' });
    if (user.verifyOtp !== otp)
      return res.status(400).json({ message: 'Invalid OTP. Try again.' });
    if (user.verifyOtpExpiry < Date.now())
      return res.status(400).json({ message: 'OTP expired. Please register again.' });

    user.isVerified      = true;
    user.verifyOtp       = null;
    user.verifyOtpExpiry = null;
    await user.save();

    res.json({ message: 'Email verified! You can now login.' });
  } catch (err) {
    console.error('VerifyEmail error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ════════════════════════════════════════════════════════
// RESEND VERIFY OTP
// POST /api/auth/resend-verify-otp
// ════════════════════════════════════════════════════════
router.post('/resend-verify-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)           return res.status(404).json({ message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified.' });

    const otp = generateOtp();
    user.verifyOtp       = otp;
    user.verifyOtpExpiry = otpExpiry();
    await user.save();

    await sendOtpEmail(email, otp, 'Email Verification');
    res.json({ message: 'OTP resent successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ════════════════════════════════════════════════════════
// LOGIN
// POST /api/auth/login
// ════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    if (!isAllowedEmail(email))
      return res.status(400).json({ message: getDomainError(email) });

    const user = await User.findOne({ email, role });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password.' });

    if (!user.isVerified)
      return res.status(403).json({
        message: 'Email not verified. Please verify your email first.',
        needsVerification: true,
        email,
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Include _id in response so frontend can match rooms
    res.json({
      token,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ════════════════════════════════════════════════════════
// FORGOT PASSWORD — Send OTP
// POST /api/auth/forgot-password
// ════════════════════════════════════════════════════════
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    if (!isAllowedEmail(email))
      return res.status(400).json({ message: getDomainError(email) });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'No account found with this email.' });

    if (!user.isVerified)
      return res.status(403).json({ message: 'Please verify your email first.' });

    const otp = generateOtp();
    user.resetOtp       = otp;
    user.resetOtpExpiry = otpExpiry();
    await user.save();

    await sendOtpEmail(email, otp, 'Password Reset');
    res.json({ message: 'OTP sent to your email.' });

  } catch (err) {
    console.error('ForgotPassword error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ════════════════════════════════════════════════════════
// VERIFY RESET OTP
// POST /api/auth/verify-reset-otp
// ════════════════════════════════════════════════════════
router.post('/verify-reset-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found.' });
    if (user.resetOtp !== otp)
      return res.status(400).json({ message: 'Invalid OTP.' });
    if (user.resetOtpExpiry < Date.now())
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });

    res.json({ message: 'OTP verified.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ════════════════════════════════════════════════════════
// RESET PASSWORD
// POST /api/auth/reset-password
// ════════════════════════════════════════════════════════
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found.' });
    if (user.resetOtp !== otp)
      return res.status(400).json({ message: 'Invalid OTP.' });
    if (user.resetOtpExpiry < Date.now())
      return res.status(400).json({ message: 'OTP expired.' });

    user.password       = await bcrypt.hash(newPassword, 10);
    user.resetOtp       = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully! Please login.' });
  } catch (err) {
    console.error('ResetPassword error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ════════════════════════════════════════════════════════
// GET ALL STUDENTS
// GET /api/auth/students
// ════════════════════════════════════════════════════════
router.get('/students', async (req, res) => {
  try {
    const students = await User.find(
      { role: 'student', isVerified: true },
      '_id name email'
    );
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;