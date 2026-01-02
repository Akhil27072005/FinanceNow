const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles sending emails using nodemailer
 */

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Finance Now" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request - Finance Now',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 700;">Finance Now</h1>
          </div>
          <div style="background: #FFFFFF; padding: 40px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #111827; margin-top: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
            <p style="color: #6B7280; font-size: 16px; line-height: 1.6;">
              You requested to reset your password for your Finance Now account. Click the button below to reset your password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: #2563EB; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #2563EB; font-size: 14px; word-break: break-all; background: #F3F4F6; padding: 12px; border-radius: 6px;">
              ${resetUrl}
            </p>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px;">
              This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetEmail
};

