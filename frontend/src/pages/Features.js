import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import MarketingAuthLink from '../components/landing/MarketingAuthLink';
import MarketingScreenshot from '../components/marketing/MarketingScreenshot';
import {
  FEATURES_MORE,
  FEATURES_PILLARS,
  FEATURES_SHOWCASE
} from '../constants/marketingContent';
import '../styles/landing.css';
import '../styles/features.css';

const Features = () => {
  useEffect(() => {
    document.title = 'Features — FinanceNow';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Track transactions, plan budgets, and understand your spending with FinanceNow — dashboard, reports, subscriptions, and more.'
      );
    }
    return () => {
      document.title = 'Finance Now';
    };
  }, []);

  return (
    <div className="landing-page features-page">
      <LandingNavbar />

      <main className="features-main">
        <section className="features-hero landing-container">
          <p className="features-hero__eyebrow">Features</p>
          <h1 className="features-hero__title">Everything you need to manage your money</h1>
          <p className="features-hero__subtitle">
            Track spending, plan budgets, and understand where your money goes — month by month,
            without spreadsheets.
          </p>
          <div className="features-hero__actions">
            <MarketingAuthLink to="/register" className="landing-hero__cta landing-hero__cta--primary">
              Get started free
            </MarketingAuthLink>
            <Link to="/login" className="features-hero__secondary">
              Already have an account? Log in
            </Link>
          </div>
        </section>

        <section className="features-pillars landing-container" aria-label="How FinanceNow helps">
          <ul className="features-pillars__grid">
            {FEATURES_PILLARS.map((pillar) => (
              <li key={pillar.id} className="features-pillars__card">
                <span className="features-pillars__label">{pillar.label}</span>
                <h2 className="features-pillars__title">{pillar.title}</h2>
                <p className="features-pillars__text">{pillar.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="features-showcase" aria-label="Product features">
          {FEATURES_SHOWCASE.map((section, index) => (
            <article
              key={section.id}
              className={`features-showcase__row landing-container${
                index % 2 === 1 ? ' features-showcase__row--reverse' : ''
              }`}
            >
              <div className="features-showcase__copy">
                <span className="features-showcase__pillar">{section.pillar}</span>
                <h2 className="features-showcase__title">{section.title}</h2>
                <p className="features-showcase__description">{section.description}</p>
                <ul className="features-showcase__bullets">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Check size={16} strokeWidth={2.5} aria-hidden />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <MarketingScreenshot src={section.image} alt={section.imageAlt} />
            </article>
          ))}
        </section>

        <section className="features-more landing-container" aria-label="More capabilities">
          <div className="features-more__header">
            <h2 className="features-more__title">And there is more</h2>
            <p className="features-more__subtitle">
              FinanceNow covers the full personal finance workflow — not just a transaction list.
            </p>
          </div>
          <ul className="features-more__grid">
            {FEATURES_MORE.map((item) => (
              <li key={item.title} className="features-more__card">
                <h3 className="features-more__card-title">{item.title}</h3>
                <p className="features-more__card-text">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="features-cta landing-container">
          <div className="features-cta__panel">
            <h2 className="features-cta__title">Ready to see your finances clearly?</h2>
            <p className="features-cta__text">
              Create a free account and start with your dashboard, budgets, and reports today.
            </p>
            <MarketingAuthLink to="/register" className="landing-hero__cta landing-hero__cta--primary">
              Get started free
            </MarketingAuthLink>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;
