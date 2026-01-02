import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Custom Button Component
 * Replaces Bootstrap buttons with modern fintech styling
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontWeight: 500,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    outline: 'none',
    position: 'relative'
  };

  const sizeStyles = {
    sm: {
      padding: '6px 12px',
      fontSize: '13px',
      borderRadius: '10px'
    },
    md: {
      padding: '10px 18px',
      fontSize: '14px',
      borderRadius: '12px'
    },
    lg: {
      padding: '12px 24px',
      fontSize: '15px',
      borderRadius: '12px'
    }
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--info)',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(41, 121, 255, 0.2)',
      border: 'none'
    },
    secondary: {
      backgroundColor: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-light)',
      boxShadow: 'none'
    },
    danger: {
      backgroundColor: 'var(--danger)',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(255, 82, 82, 0.2)',
      border: 'none'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      border: 'none',
      padding: '4px 8px'
    }
  };

  const hoverStyles = {
    primary: {
      backgroundColor: '#1c6be1',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(41, 121, 255, 0.3)'
    },
    secondary: {
      backgroundColor: 'var(--bg-main)',
      borderColor: 'var(--info)',
      color: 'var(--info)'
    },
    danger: {
      backgroundColor: '#ff3838',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(255, 82, 82, 0.3)'
    },
    ghost: {
      backgroundColor: 'var(--bg-main)'
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !disabled && !loading ? hoverStyles[variant] : {}),
    opacity: disabled || loading ? 0.6 : 1
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={combinedStyles}
      {...props}
    >
      {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
      {children}
    </button>
  );
};

export default Button;

