import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Loader2 } from 'lucide-react';
import {
  AUTH_SWITCH_STATE,
  MARKETING_TRANSITION_MS,
  TO_MARKETING_STATE
} from '../../utils/authRouteState';
import '../../styles/auth.css';

const AuthLayout = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const cardAnimationClass = useMemo(() => {
    if (isExiting) return 'auth-page__card--exit';
    if (location.state?.fromMarketing) return 'auth-page__card--from-marketing';
    if (location.state?.authSwitch) return 'auth-page__card--switch';
    return 'auth-page__card--enter';
  }, [location.state, isExiting]);

  const handleBackdropClick = () => {
    if (isExiting) return;
    setIsExiting(true);
    window.setTimeout(() => {
      navigate('/', { state: TO_MARKETING_STATE });
    }, MARKETING_TRANSITION_MS);
  };

  return (
    <div className={`auth-page${isExiting ? ' auth-page--exit' : ''}`}>
      <button
        type="button"
        className="auth-page__backdrop"
        onClick={handleBackdropClick}
        aria-label="Back to home"
        disabled={isExiting}
      />
      <div className="auth-page__center">
        <div className={`auth-page__card ${cardAnimationClass}`}>
          <img
            src={`${process.env.PUBLIC_URL}/FinanceNow_logo1.svg`}
            alt="FinanceNow"
            className="auth-page__logo"
          />
          <h1 className="auth-page__title">{title}</h1>
          <p className="auth-page__subtitle">{subtitle}</p>

          <div className="auth-page__form modal-glass__body">{children}</div>

          {footerText && footerLinkText && footerLinkTo ? (
            <p className="auth-page__footer">
              {footerText}
              <Link
                to={footerLinkTo}
                state={AUTH_SWITCH_STATE}
                replace
                className="auth-page__footer-link"
              >
                {footerLinkText}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export const AuthDivider = () => (
  <div className="auth-page__divider" role="separator">
    <span className="auth-page__divider-line" />
    <span className="auth-page__divider-text">Or continue with</span>
    <span className="auth-page__divider-line" />
  </div>
);

export const AuthGoogleButton = ({ onClick, label = 'Google Account' }) => (
  <button type="button" className="auth-page__google" onClick={onClick}>
    <Icon icon="logos:google-icon" style={{ fontSize: '20px' }} aria-hidden />
    <span>{label}</span>
  </button>
);

export const AuthSubmitButton = ({ loading, children, ...props }) => (
  <button type="submit" className="auth-page__submit" disabled={loading} {...props}>
    {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
    <span>{children}</span>
  </button>
);

export default AuthLayout;
