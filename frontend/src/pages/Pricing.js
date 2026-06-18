import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import MarketingAuthLink from '../components/landing/MarketingAuthLink';
import {
  PRICING_FAQ,
  PRICING_INCLUDED,
  PRICING_PLAN,
  PRICING_WHY_FREE
} from '../constants/marketingContent';
import '../styles/landing.css';
import '../styles/pricing.css';

const Pricing = () => {
  useEffect(() => {
    document.title = 'Pricing — FinanceNow';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'FinanceNow is free to use — full access to transactions, budgets, reports, subscriptions, and more. No credit card required.'
      );
    }
    return () => {
      document.title = 'Finance Now';
    };
  }, []);

  return (
    <div className="landing-page pricing-page">
      <LandingNavbar />

      <main className="pricing-main">
        <section className="pricing-hero landing-container">
          <p className="pricing-hero__eyebrow">Pricing</p>
          <h1 className="pricing-hero__title">Free to use. No catch today.</h1>
          <p className="pricing-hero__subtitle">
            FinanceNow is not paywalled while we build and improve it. Create an account and use
            everything you see — no credit card, no trial countdown.
          </p>
        </section>

        <section className="pricing-plan landing-container" aria-label="Current plan">
          <div className="pricing-plan__card">
            <div className="pricing-plan__header">
              <span className="pricing-plan__badge">{PRICING_PLAN.name}</span>
              <p className="pricing-plan__price">{PRICING_PLAN.price}</p>
              <p className="pricing-plan__period">{PRICING_PLAN.period}</p>
              <p className="pricing-plan__description">{PRICING_PLAN.description}</p>
            </div>

            <ul className="pricing-plan__features">
              {PRICING_INCLUDED.map((item) => (
                <li key={item}>
                  <Check size={16} strokeWidth={2.5} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <MarketingAuthLink to="/register" className="landing-hero__cta landing-hero__cta--primary pricing-plan__cta">
              {PRICING_PLAN.cta}
            </MarketingAuthLink>
          </div>
        </section>

        <section className="pricing-why landing-container" aria-labelledby="pricing-why-title">
          <div className="pricing-why__panel">
            <h2 id="pricing-why-title" className="pricing-why__title">
              {PRICING_WHY_FREE.title}
            </h2>
            {PRICING_WHY_FREE.paragraphs.map((paragraph) => (
              <p key={paragraph} className="pricing-why__paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="pricing-faq landing-container" aria-labelledby="pricing-faq-title">
          <div className="pricing-faq__header">
            <h2 id="pricing-faq-title" className="pricing-faq__title">
              Frequently asked questions
            </h2>
          </div>
          <ul className="pricing-faq__list">
            {PRICING_FAQ.map((item) => (
              <li key={item.question} className="pricing-faq__item">
                <h3 className="pricing-faq__question">{item.question}</h3>
                <p className="pricing-faq__answer">{item.answer}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="pricing-cta landing-container">
          <div className="pricing-cta__panel">
            <h2 className="pricing-cta__title">Start tracking for free</h2>
            <p className="pricing-cta__text">
              Set up your account in minutes. Your dashboard, budgets, and reports are waiting.
            </p>
            <div className="pricing-cta__actions">
              <MarketingAuthLink to="/register" className="landing-hero__cta landing-hero__cta--primary">
                Create free account
              </MarketingAuthLink>
              <Link to="/features" className="pricing-cta__link">
                See what is included
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Pricing;
