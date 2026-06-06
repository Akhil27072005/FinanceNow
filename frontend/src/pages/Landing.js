import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import '../styles/landing.css';

/**
 * Public marketing landing page (hero + navbar).
 */
const Landing = () => {
  useEffect(() => {
    document.title = 'FinanceNow — Maximize Your Financial Potential';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'FinanceNow — financial management with simplicity and efficiency.'
      );
    }
    return () => {
      document.title = 'Finance Now';
    };
  }, []);

  return (
    <div className="landing-page">
      <LandingNavbar />
      <main className="landing-main">
        <div className="landing-container">
          <LandingHero />
        </div>
      </main>
    </div>
  );
};

export default Landing;
