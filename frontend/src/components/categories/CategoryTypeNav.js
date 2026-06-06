import React from 'react';
import { CATEGORY_TYPES } from '../../constants/categoryIcons';

const CategoryTypeNav = ({ activeType, onChange, counts = {} }) => (
  <div className="category-type-nav-column">
    <nav className="category-type-nav glass-panel" aria-label="Category types">
      {CATEGORY_TYPES.map((type) => {
        const isActive = activeType === type.id;
        const count = counts[type.id] ?? 0;
        return (
          <button
            key={type.id}
            type="button"
            className={`category-type-nav__item ${isActive ? 'category-type-nav__item--active' : ''}`}
            onClick={() => onChange(type.id)}
            aria-current={isActive ? 'true' : undefined}
          >
            <span className="category-type-nav__label">{type.label}</span>
            <span className="category-type-nav__meta">
              <span className="category-type-nav__desc">{type.description}</span>
              <span className="category-type-nav__count">{count}</span>
            </span>
          </button>
        );
      })}
    </nav>
    <div className="category-type-nav-mobile" role="tablist" aria-label="Category types">
      {CATEGORY_TYPES.map((type) => {
        const isActive = activeType === type.id;
        return (
          <button
            key={type.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`category-type-nav-mobile__chip ${isActive ? 'category-type-nav-mobile__chip--active' : ''}`}
            onClick={() => onChange(type.id)}
          >
            {type.label}
            <span className="category-type-nav-mobile__count">{counts[type.id] ?? 0}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default CategoryTypeNav;
