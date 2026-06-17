import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import '../styles/landing.css';

const Landing = () => {
  const location = useLocation();
  const enterFromAuth = Boolean(location.state?.toMarketing);

  useEffect(() => {
    document.title = 'FinanceNow — All your finances, one place';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Track transactions, manage budgets and subscriptions, and see where your money goes — month by month.'
      );
    }
    return () => {
      document.title = 'Finance Now';
      document.querySelector('.landing-page')?.classList.remove('landing-page--exit');
    };
  }, []);

  useEffect(() => {
    if (!enterFromAuth) return undefined;
    const id = window.setTimeout(() => {
      window.history.replaceState({}, document.title);
    }, 520);
    return () => window.clearTimeout(id);
  }, [enterFromAuth]);

  return (
    <div className={`landing-page${enterFromAuth ? ' landing-page--enter' : ''}`}>
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
