import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FROM_MARKETING_STATE, MARKETING_TRANSITION_MS } from '../../utils/authRouteState';

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
    }, MARKETING_TRANSITION_MS);
  };

  return (
    <Link to={to} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default MarketingAuthLink;
