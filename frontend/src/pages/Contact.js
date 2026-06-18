import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import Select from '../components/ui/Select';
import { CONTACT_INTRO, CONTACT_TOPICS } from '../constants/marketingContent';
import { contactService } from '../services/contactService';
import '../styles/landing.css';
import '../styles/modal-glass.css';
import '../styles/contact.css';

const TOPIC_OPTIONS = CONTACT_TOPICS.map((topic) => ({
  value: topic.value,
  label: topic.label
}));

const INITIAL_FORM = {
  name: '',
  email: '',
  topic: 'feedback',
  message: '',
  website: ''
};

const Contact = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    document.title = 'Contact — FinanceNow';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Get in touch with the FinanceNow team — support, feedback, feature ideas, and bug reports.'
      );
    }
    return () => {
      document.title = 'Finance Now';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await contactService.submitFeedback({
        name: form.name.trim(),
        email: form.email.trim(),
        topic: form.topic,
        message: form.message.trim(),
        website: form.website
      });
      setSuccess(result.message || CONTACT_INTRO.replyNote);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Could not send your message right now. Please try again in a few minutes.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page contact-page">
      <LandingNavbar />

      <main className="contact-main">
        <section className="contact-hero landing-container">
          <p className="contact-hero__eyebrow">Contact</p>
          <h1 className="contact-hero__title">Get in touch</h1>
          <p className="contact-hero__subtitle">
            Questions, feedback, bugs, or ideas — send a message and the developer will read it.
          </p>
        </section>

        <section className="contact-layout landing-container">
          <aside className="contact-aside" aria-label="Contact topics">
            <h2 className="contact-aside__title">{CONTACT_INTRO.title}</h2>
            <p className="contact-aside__text">{CONTACT_INTRO.description}</p>
            <ul className="contact-aside__topics">
              {CONTACT_TOPICS.map((topic) => (
                <li key={topic.value} className="contact-aside__topic">
                  <span className="contact-aside__topic-label">{topic.label}</span>
                  <span className="contact-aside__topic-desc">{topic.description}</span>
                </li>
              ))}
            </ul>
            <p className="contact-aside__note">{CONTACT_INTRO.replyNote}</p>
          </aside>

          <div className="contact-form-panel">
            {success ? (
              <div className="contact-success" role="status">
                <CheckCircle2 size={40} strokeWidth={1.75} aria-hidden />
                <h2 className="contact-success__title">Message sent</h2>
                <p className="contact-success__text">{success}</p>
                <button
                  type="button"
                  className="contact-form__secondary-btn"
                  onClick={() => setSuccess('')}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <h2 className="contact-form__title">Send a message</h2>

                {error ? (
                  <div className="contact-form__error" role="alert">
                    {error}
                  </div>
                ) : null}

                <div className="contact-form__field contact-form__field--honeypot" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    maxLength={120}
                    autoComplete="name"
                  />
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-topic">Topic</label>
                  <Select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, topic: e.target.value }));
                      if (error) setError('');
                    }}
                    options={TOPIC_OPTIONS}
                    glass
                    glassTriggerClassName="contact-form__select-trigger"
                    glassMenuClassName="contact-form__select-menu"
                    required
                  />
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us what is on your mind..."
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={6}
                  />
                </div>

                <button
                  type="submit"
                  className="landing-hero__cta landing-hero__cta--primary contact-form__submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="contact-form__spinner" aria-hidden />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} aria-hidden />
                      Send message
                    </>
                  )}
                </button>

                <p className="contact-form__footer">
                  Prefer to explore first?{' '}
                  <Link to="/features" className="contact-form__link">
                    See features
                  </Link>
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
