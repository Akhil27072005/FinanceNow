import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

/**
 * Icon Button Component for Edit and Delete actions
 */
const IconButton = ({ 
  type = 'edit', // 'edit' or 'delete'
  onClick,
  size = 18,
  className = '',
  ...props 
}) => {
  const icon = type === 'edit' ? Edit2 : Trash2;
  const Icon = icon;
  
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
    }
  };

  const hoverStyles = {
    edit: {
      backgroundColor: 'rgba(41, 121, 255, 0.1)',
      transform: 'scale(1.05)'
    },
    delete: {
      backgroundColor: 'rgba(255, 82, 82, 0.1)',
      transform: 'scale(1.05)'
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

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

