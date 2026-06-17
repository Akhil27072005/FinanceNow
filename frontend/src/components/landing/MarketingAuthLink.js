import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FROM_MARKETING_STATE } from '../../utils/authRouteState';

const EXIT_MS = 260;

/**
 * Link from landing → auth with a coordinated exit / enter animation.
 */
const MarketingAuthLink = ({ to, className, children, onClick, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    e.preventDefault();
    document.querySelector('.landing-page')?.classList.add('landing-page--exit');

    window.setTimeout(() => {
      navigate(to, { state: FROM_MARKETING_STATE });
    }, EXIT_MS);
  };

  return (
    <Link to={to} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default MarketingAuthLink;
