const { sendContactFeedbackEmail } = require('../utils/emailService');

const CONTACT_TOPICS = {
  support: 'Support',
  feature: 'Feature idea',
  bug: 'Bug report',
  feedback: 'General feedback',
  other: 'Other'
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/contact
 * Public contact / feedback form (no auth).
 */
const submitContact = async (req, res, next) => {
  try {
    if (req.body.website) {
      return res.json({ success: true, message: 'Message received' });
    }

    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const topic = String(req.body.topic || '').trim();
    const message = String(req.body.message || '').trim();

    if (!name || !email || !topic || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, topic, and message are required'
      });
    }

    if (name.length > 120) {
      return res.status(400).json({
        success: false,
        error: 'Name must be 120 characters or fewer'
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    if (!CONTACT_TOPICS[topic]) {
      return res.status(400).json({
        success: false,
        error: 'Please select a valid topic'
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Message must be at least 10 characters'
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Message must be 5000 characters or fewer'
      });
    }

    await sendContactFeedbackEmail({
      name,
      email,
      topic,
      topicLabel: CONTACT_TOPICS[topic],
      message
    });

    res.json({
      success: true,
      message:
        'Your message has been sent. If a reply is needed, we will reach out to the email address you provided.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  CONTACT_TOPICS
};
