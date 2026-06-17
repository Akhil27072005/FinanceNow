import React from 'react';
import '../../styles/auth-loader.css';

/**
 * Auth boot loader — bar chart centered inside a rotating ring.
 */
const AuthLoader = ({ size = 96, label = 'Loading…' }) => {
  return (
    <div className="auth-loader" role="status" aria-live="polite" aria-label={label}>
      <svg
        className="auth-loader__svg"
        width={size}
        height={size}
        viewBox="0 0 96 96"
        aria-hidden="true"
        focusable="false"
      >
        <g className="auth-loader__ring">
          <circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="66 198"
            opacity="0.92"
          />
        </g>

        <line
          className="auth-loader__baseline"
          x1="24"
          y1="58"
          x2="72"
          y2="58"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.22"
        />

        <g className="auth-loader__bars">
          <rect className="auth-loader__bar auth-loader__bar--1" x="28" y="42" width="8" height="16" rx="2" />
          <rect className="auth-loader__bar auth-loader__bar--2" x="40" y="36" width="8" height="22" rx="2" />
          <rect className="auth-loader__bar auth-loader__bar--3" x="52" y="44" width="8" height="14" rx="2" />
          <rect className="auth-loader__bar auth-loader__bar--4" x="64" y="32" width="8" height="26" rx="2" />
        </g>
      </svg>
      <span className="visually-hidden">{label}</span>
    </div>
  );
};

export default AuthLoader;
