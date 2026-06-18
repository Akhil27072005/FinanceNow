import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import '../../styles/responsive-dev.css';

const ROUTES = [
  { label: 'Landing', path: '/', public: true },
  { label: 'Features', path: '/features', public: true },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Reports', path: '/reports' },
  { label: 'Budgets', path: '/budgets' },
  { label: 'Subscriptions', path: '/subscriptions' },
  { label: 'Investments', path: '/investments' },
  { label: 'Categories', path: '/categories' },
  { label: 'Payment Methods', path: '/payment-methods' },
  { label: 'Settings', path: '/settings' },
  { label: 'Loading preview', path: '/dev/loading' }
];

/**
 * Dev-only responsive QA helper — viewport width + quick route links.
 */
const ResponsiveDev = () => {
  const bp = useBreakpoint();
  const [liveWidth, setLiveWidth] = useState(bp.width);

  useEffect(() => {
    setLiveWidth(window.innerWidth);
    const onResize = () => setLiveWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [bp.width]);

  const activeLabel = bp.isXs
    ? 'xs'
    : bp.isSm
      ? 'sm'
      : bp.isMd
        ? 'md'
        : bp.isLg
          ? 'lg'
          : bp.isXl
            ? 'xl'
            : '2xl';

  return (
    <div className="responsive-dev">
      <header className="responsive-dev__header glass-panel">
        <h1 className="responsive-dev__title">Responsive QA</h1>
        <p className="responsive-dev__meta">
          Viewport: <strong>{liveWidth}px</strong> · Breakpoint: <strong>{activeLabel}</strong>
          {bp.isMobile ? ' · mobile shell' : ' · desktop shell'}
        </p>
      </header>

      <section className="responsive-dev__section glass-panel">
        <h2 className="responsive-dev__section-title">Quick links</h2>
        <ul className="responsive-dev__links">
          {ROUTES.map((route) => (
            <li key={route.path}>
              <Link to={route.path} className="responsive-dev__link">
                {route.label}
                {route.public ? ' (public)' : ''}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="responsive-dev__section glass-panel">
        <h2 className="responsive-dev__section-title">Suggested widths</h2>
        <ul className="responsive-dev__widths">
          <li>375 — iPhone SE</li>
          <li>390 — iPhone 14 Pro</li>
          <li>768 — iPad Mini (sidebar visible)</li>
          <li>1024 — iPad Pro / desktop dashboard fit</li>
          <li>1440 — Desktop regression</li>
        </ul>
      </section>
    </div>
  );
};

export default ResponsiveDev;
