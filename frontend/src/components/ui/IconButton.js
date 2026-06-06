import React from 'react';
import { Copy, Edit2, Trash2 } from 'lucide-react';

/**
 * Icon Button Component for Edit and Delete actions
 */
const IconButton = ({
  type = 'edit', // 'edit' | 'delete' | 'duplicate'
  onClick,
  size = 18,
  className = '',
  glass = false,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const icons = { edit: Edit2, delete: Trash2, duplicate: Copy };
  const Icon = icons[type] || Edit2;
  const ariaLabels = {
    edit: 'Edit',
    delete: 'Delete',
    duplicate: 'Duplicate'
  };

  if (glass) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`pm-glass-action pm-glass-action--${type} ${className}`.trim()}
        aria-label={ariaLabels[type] || 'Action'}
        {...props}
      >
        <Icon size={size} strokeWidth={2} />
      </button>
    );
  }

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: 'transparent'
  };

  const typeStyles = {
    edit: {
      color: 'var(--info)',
      backgroundColor: 'transparent'
    },
    delete: {
      color: 'var(--danger)',
      backgroundColor: 'transparent'
    },
    duplicate: {
      color: 'var(--accent-text)',
      backgroundColor: 'transparent'
    }
  };

  const hoverStyles = {
    edit: {
      backgroundColor: 'var(--app-accent-soft)',
      transform: 'scale(1.05)'
    },
    delete: {
      backgroundColor: 'rgba(255, 82, 82, 0.1)',
      transform: 'scale(1.05)'
    },
    duplicate: {
      backgroundColor: 'rgba(237, 233, 254, 0.65)',
      transform: 'scale(1.05)'
    }
  };

  const combinedStyles = {
    ...baseStyles,
    ...typeStyles[type],
    ...(isHovered ? hoverStyles[type] : {}),
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={combinedStyles}
      {...props}
    >
      <Icon size={size} strokeWidth={1.75} />
    </button>
  );
};

export default IconButton;

