import React from 'react';
import { Alert } from 'react-bootstrap';
import '../../styles/glass-alert.css';

/**
 * Frosted glass dismissible alert (settings success/error feedback).
 */
const GlassAlert = ({
  variant = 'success',
  children,
  onClose,
  className = '',
  ...props
}) => (
  <Alert
    variant={variant}
    dismissible={Boolean(onClose)}
    onClose={onClose}
    className={`glass-alert glass-alert--${variant} ${className}`.trim()}
    {...props}
  >
    {children}
  </Alert>
);

export default GlassAlert;
