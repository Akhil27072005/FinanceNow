import React from 'react';
import { Icon } from '@iconify/react';
import { getCategoryIcon, getIconDisplayColor } from '../../constants/categoryIcons';

const CategoryIconDisplay = ({
  icon,
  size = 24,
  className = '',
  color,
  categoryType
}) => {
  const iconId = getCategoryIcon(icon);
  const displayColor = color ?? getIconDisplayColor(iconId, categoryType);

  return (
    <Icon
      icon={iconId}
      width={size}
      height={size}
      className={className}
      style={{ color: displayColor }}
      aria-hidden
    />
  );
};

export default CategoryIconDisplay;
