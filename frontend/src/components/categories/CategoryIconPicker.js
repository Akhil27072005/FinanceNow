import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import {
  filterCategoryIcons,
  getCategoryIcon,
  getIconDisplayColor
} from '../../constants/categoryIcons';

const CategoryIconPicker = ({ value, onChange, label = 'Category icon', categoryType }) => {
  const [search, setSearch] = useState('');
  const selected = getCategoryIcon(value);
  const icons = useMemo(() => filterCategoryIcons(search), [search]);

  return (
    <div className="category-icon-picker">
      <p className="category-icon-picker__label">{label}</p>
      <input
        type="search"
        className="category-icon-picker__search form-control"
        placeholder="Search icons…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search icons"
      />
      <div className="category-icon-picker__grid" role="listbox" aria-label="Choose an icon">
        {icons.length === 0 ? (
          <p className="category-icon-picker__empty">No icons match your search.</p>
        ) : (
          icons.map((item) => {
            const isSelected = item.id === selected;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`category-icon-picker__item ${isSelected ? 'category-icon-picker__item--selected' : ''}`}
                title={item.label}
                onClick={() => onChange(item.id)}
              >
                <Icon
                  icon={item.id}
                  width={22}
                  height={22}
                  style={{ color: getIconDisplayColor(item.id, categoryType) }}
                  aria-hidden
                />
                <span className="category-icon-picker__item-label">{item.label}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategoryIconPicker;
