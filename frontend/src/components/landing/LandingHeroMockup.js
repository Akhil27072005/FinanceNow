import React from 'react';

const MastercardLogo = () => (
  <svg width="38" height="24" viewBox="0 0 38 24" fill="none" aria-hidden="true">
    <circle cx="14" cy="12" r="10" fill="#EB001B" opacity="0.92" />
    <circle cx="24" cy="12" r="10" fill="#F79E1B" opacity="0.92" />
  </svg>
);

const LineChartSvg = () => (
  <svg className="landing-dash__line-chart" viewBox="0 0 200 88" fill="none" aria-hidden="true">
    <line x1="0" y1="22" x2="200" y2="22" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <line x1="0" y1="44" x2="200" y2="44" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <line x1="0" y1="66" x2="200" y2="66" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <path
      d="M4 62 L36 48 L68 54 L100 30 L132 38 L164 18 L196 26"
      stroke="url(#landing-line-gradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="100" cy="30" r="4" fill="#FF8A5C" />
    <defs>
      <linearGradient id="landing-line-gradient" x1="4" y1="62" x2="196" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF8A5C" />
        <stop offset="1" stopColor="#B264FF" />
      </linearGradient>
    </defs>
  </svg>
);

const DonutChartSvg = () => (
  <svg className="landing-dash__donut" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
    <circle
      cx="50"
      cy="50"
      r="36"
      fill="none"
      stroke="#FF6B9D"
      strokeWidth="12"
      strokeDasharray="68 226"
      strokeLinecap="round"
      transform="rotate(-90 50 50)"
    />
    <circle
      cx="50"
      cy="50"
      r="36"
      fill="none"
      stroke="#4ADE80"
      strokeWidth="12"
      strokeDasharray="52 226"
      strokeDashoffset="-72"
      strokeLinecap="round"
      transform="rotate(-90 50 50)"
    />
    <circle
      cx="50"
      cy="50"
      r="36"
      fill="none"
      stroke="#60A5FA"
      strokeWidth="12"
      strokeDasharray="45 226"
      strokeDashoffset="-128"
      strokeLinecap="round"
      transform="rotate(-90 50 50)"
    />
    <circle
      cx="50"
      cy="50"
      r="36"
      fill="none"
      stroke="#FBBF24"
      strokeWidth="12"
      strokeDasharray="38 226"
      strokeDashoffset="-177"
      strokeLinecap="round"
      transform="rotate(-90 50 50)"
    />
  </svg>
);

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 1.5a4 4 0 0 0-4 4v2.2c0 .5-.2 1-.5 1.4L2.8 11h10.4l-.7-1.9c-.3-.4-.5-.9-.5-1.4V5.5a4 4 0 0 0-4-4Z"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path d="M6.5 12a1.5 1.5 0 0 0 3 0" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="6.25" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    <path
      d="M4.2 7.1 6.1 9 9.8 5.3"
      stroke="#4ADE80"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AvatarSvg = ({ seed = 0 }) => {
  const palettes = [
    ['#FF8A5C', '#B264FF'],
    ['#60A5FA', '#4ADE80'],
    ['#F472B6', '#FBBF24'],
    ['#818CF8', '#FF6B9D']
  ];
  const [a, b] = palettes[seed % palettes.length];
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <defs>
        <linearGradient id={`avatar-grad-${seed}`} x1="0" y1="0" x2="28" y2="28">
          <stop stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="14" fill={`url(#avatar-grad-${seed})`} />
      <circle cx="14" cy="11" r="4.5" fill="rgba(255,255,255,0.85)" />
      <ellipse cx="14" cy="21" rx="7" ry="5" fill="rgba(255,255,255,0.75)" />
    </svg>
  );
};

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 12V4M8 4 4.5 7.5M8 4l3.5 3.5"
      stroke="#121212"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Glass dashboard mockup — inline SVG replica of reference hero visual.
 */
const LandingHeroMockup = () => {
  const checklist = [
    'April financial status check',
    'Categories reviewed',
    'Savings goal updated',
    'Subscriptions audited'
  ];

  const notifications = [
    'Review dining budget',
    'Confirm card payment',
    'Update tax documents'
  ];

  const insights = [
    'This month you spent 20% more on dining out than last month.',
    'Your savings rate improved by 8% compared to Q1.',
    '3 subscriptions renew within the next 7 days.'
  ];

  return (
    <div className="landing-dash" aria-hidden="true">
      <div className="landing-dash__shell">
        <div className="landing-dash__top">
          <div className="landing-dash__tabs">
            <span className="landing-dash__tab landing-dash__tab--active">BANK</span>
            <span className="landing-dash__tab">PAYMENTS</span>
            <span className="landing-dash__tab">ACCOUNT</span>
          </div>
          <div className="landing-dash__avatar">
            <AvatarSvg seed={2} />
          </div>
        </div>

        <div className="landing-dash__subnav">
          <span className="landing-dash__subnav-item landing-dash__subnav-item--active">DASHBOARD</span>
          <span className="landing-dash__subnav-item">ACCOUNTS</span>
          <span className="landing-dash__subnav-item">EXPENSES</span>
          <span className="landing-dash__subnav-item">SETTINGS</span>
        </div>

        <div className="landing-dash__bank-card">
          <div className="landing-dash__bank-head">
            <span className="landing-dash__label">BANK INFORMATION</span>
            <MastercardLogo />
          </div>
          <div className="landing-dash__account-no">08335 6545</div>
          <div className="landing-dash__bank-meta">
            <span className="landing-dash__meta-label">Sender&apos;s Bank Details</span>
            <span className="landing-dash__meta-name">Amanda</span>
            <span className="landing-dash__meta-mask">XXXXXXXXXXXXXX</span>
          </div>
          <div className="landing-dash__bank-actions">
            <button type="button" className="landing-dash__link-btn">
              Edit Details
            </button>
            <button type="button" className="landing-dash__confirm-btn">
              Confirm
            </button>
          </div>
        </div>

        <div className="landing-dash__grid">
          <div className="landing-dash__tile landing-dash__tile--checklist">
            <ul className="landing-dash__checklist">
              {checklist.map((item) => (
                <li key={item}>
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="landing-dash__tile landing-dash__tile--chart">
            <LineChartSvg />
          </div>

          <div className="landing-dash__tile landing-dash__tile--notify">
            <div className="landing-dash__tile-title">
              <BellIcon />
              <span>Notifications</span>
            </div>
            <ul className="landing-dash__notify-list">
              {notifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="landing-dash__tile landing-dash__tile--insights">
            <div className="landing-dash__tile-title">AI Insights</div>
            <ul className="landing-dash__insights-list">
              {insights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="landing-dash__tile landing-dash__tile--donut">
            <DonutChartSvg />
            <div className="landing-dash__legend">
              <span><i style={{ background: '#FF6B9D' }} /> Dining</span>
              <span><i style={{ background: '#4ADE80' }} /> Savings</span>
              <span><i style={{ background: '#60A5FA' }} /> Bills</span>
              <span><i style={{ background: '#FBBF24' }} /> Other</span>
            </div>
          </div>
        </div>

        <div className="landing-dash__chat">
          <span>Would you like me to automate your budgeting for next month?</span>
          <button type="button" className="landing-dash__chat-send" aria-label="Send">
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingHeroMockup;
