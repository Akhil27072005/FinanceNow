import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import MarketingAuthLink from '../components/landing/MarketingAuthLink';
import { APP_VERSION } from '../constants/appVersion';
import {
  ABOUT_AUDIENCE,
  ABOUT_BELIEFS,
  ABOUT_BUILDER,
  ABOUT_IS,
  ABOUT_IS_NOT,
  ABOUT_ORIGIN,
  ABOUT_SPREADSHEET_PAINS
} from '../constants/marketingContent';
import '../styles/landing.css';
import '../styles/about.css';

const About = () => {
  useEffect(() => {
    document.title = 'About — FinanceNow';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'FinanceNow was built to replace spreadsheet hassle with month-by-month clarity — track, plan, and understand your money in one place.'
      );
    }
    return () => {
      document.title = 'Finance Now';
    };
  }, []);

  return (
    <div className="landing-page about-page">
      <LandingNavbar />

      <main className="about-main">
        <section className="about-hero landing-container">
          <p className="about-hero__eyebrow">About</p>
          <h1 className="about-hero__title">
            Built because spreadsheets were always one step behind
          </h1>
          <p className="about-hero__subtitle">
            FinanceNow is personal finance tracking for people who want clarity — month by month —
            without maintaining a side spreadsheet.
          </p>
        </section>

        <section className="about-story landing-container" aria-labelledby="about-origin-title">
          <div className="about-story__panel">
            <h2 id="about-origin-title" className="about-story__title">
              {ABOUT_ORIGIN.title}
            </h2>
            {ABOUT_ORIGIN.paragraphs.map((paragraph) => (
              <p key={paragraph} className="about-story__paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="about-beliefs landing-container" aria-label="What we believe">
          <ul className="about-beliefs__grid">
            {ABOUT_BELIEFS.map((belief) => (
              <li key={belief.id} className="about-beliefs__card">
                <span className="about-beliefs__label">{belief.label}</span>
                <h2 className="about-beliefs__title">{belief.title}</h2>
                <p className="about-beliefs__text">{belief.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="about-compare landing-container" aria-labelledby="about-compare-title">
          <div className="about-compare__header">
            <h2 id="about-compare-title" className="about-compare__title">
              From spreadsheet pain to something you will actually use
            </h2>
            <p className="about-compare__subtitle">
              Every part of FinanceNow exists because a spreadsheet version of it was annoying.
            </p>
          </div>
          <ul className="about-compare__list">
            {ABOUT_SPREADSHEET_PAINS.map((row) => (
              <li key={row.problem} className="about-compare__row">
                <div className="about-compare__problem">
                  <X size={16} strokeWidth={2.5} aria-hidden />
                  <span>{row.problem}</span>
                </div>
                <div className="about-compare__solution">
                  <Check size={16} strokeWidth={2.5} aria-hidden />
                  <span>{row.solution}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="about-audience landing-container" aria-labelledby="about-audience-title">
          <div className="about-audience__panel">
            <h2 id="about-audience-title" className="about-audience__title">
              Who it is for
            </h2>
            <ul className="about-audience__list">
              {ABOUT_AUDIENCE.map((item) => (
                <li key={item}>
                  <Check size={16} strokeWidth={2.5} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="about-scope landing-container" aria-label="What FinanceNow is and is not">
          <div className="about-scope__grid">
            <div className="about-scope__card">
              <h2 className="about-scope__heading">What it is</h2>
              <ul className="about-scope__list">
                {ABOUT_IS.map((item) => (
                  <li key={item}>
                    <Check size={16} strokeWidth={2.5} aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="about-scope__card about-scope__card--muted">
              <h2 className="about-scope__heading">What it is not</h2>
              <ul className="about-scope__list">
                {ABOUT_IS_NOT.map((item) => (
                  <li key={item}>
                    <X size={16} strokeWidth={2.5} aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="about-builder landing-container" aria-labelledby="about-builder-title">
          <div className="about-builder__panel">
            <h2 id="about-builder-title" className="about-builder__title">
              {ABOUT_BUILDER.title}
            </h2>
            {ABOUT_BUILDER.paragraphs.map((paragraph) => (
              <p key={paragraph} className="about-builder__paragraph">
                {paragraph}
              </p>
            ))}
            <p className="about-builder__version">
              Currently on version <strong>{APP_VERSION}</strong> — actively improved.
            </p>
          </div>
        </section>

        <section className="about-cta landing-container">
          <div className="about-cta__panel">
            <h2 className="about-cta__title">Ready to leave the spreadsheet behind?</h2>
            <p className="about-cta__text">
              Create a free account and see your month at a glance — budgets, reports, and all.
            </p>
            <div className="about-cta__actions">
              <MarketingAuthLink to="/register" className="landing-hero__cta landing-hero__cta--primary">
                Get started free
              </MarketingAuthLink>
              <Link to="/features" className="about-cta__link">
                Explore features
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
