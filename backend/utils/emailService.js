const nodemailer = require('nodemailer');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const trimEnv = (key) => process.env[key]?.trim() || '';

/** App passwords are often copied with spaces — strip them for SMTP auth. */
const smtpPassword = () => trimEnv('SMTP_PASS').replace(/\s+/g, '');

const getSmtpUser = () => trimEnv('SMTP_USER');

/**
 * Envelope "from" must be a real address accepted by the SMTP server (usually SMTP_USER).
 */
const getFromEmail = () => {
  const configured = trimEnv('SMTP_FROM');
  if (EMAIL_REGEX.test(configured)) return configured;
  return getSmtpUser();
};

const formatFrom = (displayName) => `"${displayName}" <${getFromEmail()}>`;

const createTransporter = () => {
  const user = getSmtpUser();
  const pass = smtpPassword();

  return nodemailer.createTransport({
    host: trimEnv('SMTP_HOST'),
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass }
  });
};

const mapMailError = (error, fallbackMessage) => {
  if (error.statusCode) return error;

  if (error.code === 'EAUTH') {
    const err = new Error(
      'Email authentication failed. Check SMTP_USER and SMTP_PASS (use a Gmail App Password).'
    );
    err.statusCode = 503;
    return err;
  }

  const err = new Error(fallbackMessage);
  err.statusCode = 503;
  return err;
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
      from: formatFrom('Finance Now'),
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
    throw mapMailError(error, 'Failed to send password reset email');
  }
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Send contact / feedback form submission to the developer inbox.
 * Recipient is read from CONTACT_FEEDBACK_TO (never exposed to the client).
 */
const sendContactFeedbackEmail = async ({ name, email, topic, topicLabel, message }) => {
  const to = trimEnv('CONTACT_FEEDBACK_TO');
  if (!to) {
    const err = new Error('Contact form is not configured');
    err.statusCode = 503;
    throw err;
  }

  if (!trimEnv('SMTP_HOST') || !getSmtpUser() || !smtpPassword()) {
    const err = new Error('Email service is not configured');
    err.statusCode = 503;
    throw err;
  }

  try {
    const transporter = createTransporter();
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeTopic = escapeHtml(topicLabel || topic);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    const mailOptions = {
      from: formatFrom('FinanceNow Contact'),
      to,
      replyTo: email,
      subject: `[FinanceNow] ${topicLabel || topic} — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #111827; margin-top: 0;">New contact form message</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #6B7280; width: 100px;">Name</td>
              <td style="padding: 8px 0; color: #111827;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Email</td>
              <td style="padding: 8px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Topic</td>
              <td style="padding: 8px 0; color: #111827;">${safeTopic}</td>
            </tr>
          </table>
          <h3 style="color: #111827; font-size: 16px; margin: 24px 0 8px;">Message</h3>
          <div style="color: #374151; font-size: 14px; line-height: 1.6; background: #F9FAFB; padding: 16px; border-radius: 8px; border: 1px solid #E5E7EB;">
            ${safeMessage}
          </div>
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">
            Reply directly to this email to reach the sender.
          </p>
        </div>
      `,
      text: `Name: ${name}\nEmail: ${email}\nTopic: ${topicLabel || topic}\n\n${message}`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending contact feedback email:', error);
    throw mapMailError(error, 'Failed to send message');
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendContactFeedbackEmail,
  createTransporter,
  getFromEmail
};
