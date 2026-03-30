const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpEmailTemplate = (otp, purpose) => `
  <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;
              border-radius:16px;border:1px solid #e5e7eb;background:#fff;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#4f46e5;font-size:24px;margin:0;">🏠 Hostel Management</h1>
    </div>
    <p style="color:#374151;font-size:15px;">Your OTP for <strong>${purpose}</strong>:</p>
    <div style="text-align:center;margin:28px 0;">
      <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#4f46e5;
                   background:#eef2ff;padding:16px 28px;border-radius:12px;">
        ${otp}
      </span>
    </div>
    <p style="color:#6b7280;font-size:13px;text-align:center;">
      ⏱ Valid for <strong>10 minutes</strong>. Do not share this with anyone.
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
    <p style="color:#9ca3af;font-size:12px;text-align:center;">
      If you didn't request this, please ignore this email.
    </p>
  </div>
`;

const sendOtpEmail = async (toEmail, otp, purpose) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📧 [DEV MODE] OTP for ${toEmail} (${purpose}): ${otp}\n`);
    return;
  }

  await transporter.sendMail({
    from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Hostel Management - ${purpose} OTP`,
    html: otpEmailTemplate(otp, purpose),
  });
};

module.exports = { sendOtpEmail };