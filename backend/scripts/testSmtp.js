/**
 * Verify SMTP credentials. Run from backend/: npm run test:smtp
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { createTransporter, getFromEmail } = require('../utils/emailService');

async function main() {
  const user = process.env.SMTP_USER?.trim();
  const host = process.env.SMTP_HOST?.trim();
  const to = process.env.CONTACT_FEEDBACK_TO?.trim();

  if (!host || !user || !process.env.SMTP_PASS?.trim()) {
    console.error('❌ Missing SMTP_HOST, SMTP_USER, or SMTP_PASS in backend/.env');
    process.exit(1);
  }

  if (!to) {
    console.error('❌ Missing CONTACT_FEEDBACK_TO in backend/.env');
    process.exit(1);
  }

  console.log('Verifying SMTP login for:', user);
  console.log('From envelope:', getFromEmail());
  console.log('Contact inbox:', to);

  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✔ SMTP authentication successful');
  } catch (error) {
    console.error('❌ SMTP failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('');
      console.error('Gmail fix:');
      console.error('  1. Enable 2-Step Verification on the Google account');
      console.error('  2. Create an App Password: https://myaccount.google.com/apppasswords');
      console.error('  3. Set SMTP_PASS to the 16-character app password (no spaces)');
      console.error('  4. SMTP_USER must be the same Gmail address');
    }
    process.exit(1);
  }
}

main();
