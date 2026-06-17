import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import '../styles/landing.css';

const Landing = () => {
  useEffect(() => {
    document.title = 'FinanceNow — Take Control of Your Money with AI';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Track spending, save smarter, and get personalized financial insights—powered by AI.'
      );
    }
    return () => {
      document.title = 'Finance Now';
      document.querySelector('.landing-page')?.classList.remove('landing-page--exit');
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
