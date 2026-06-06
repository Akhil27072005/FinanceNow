import React, { useMemo } from 'react';
import { CATEGORY_TYPES } from '../../constants/categoryIcons';
import CategoryIconDisplay from '../categories/CategoryIconDisplay';

const CategoryNav = ({
  categories,
  activeType,
  onTypeChange,
  activeCategoryId,
  onCategoryChange,
  countsByCategory = {}
}) => {
  const categoriesByType = useMemo(() => {
    const grouped = {};
    CATEGORY_TYPES.forEach((t) => {
      grouped[t.id] = categories
        .filter((c) => c.type === t.id)
        .sort((a, b) => a.name.localeCompare(b.name));
    });
    return grouped;
  }, [categories]);

  const mobileCategories = categoriesByType[activeType] || [];

  return (
    <div className="category-nav-column">
      <nav className="category-nav glass-panel" aria-label="Categories">
        {CATEGORY_TYPES.map((type) => {
          const typeCategories = categoriesByType[type.id] || [];
          if (typeCategories.length === 0) return null;

          return (
            <div key={type.id} className="category-nav__section">
              <p className="category-nav__section-label">{type.label}</p>
              <ul className="category-nav__list">
                {typeCategories.map((category) => {
                  const isActive = activeCategoryId === category._id;
                  const count = countsByCategory[category._id] ?? 0;
                  return (
                    <li key={category._id}>
                      <button
                        type="button"
                        className={`category-nav__item ${isActive ? 'category-nav__item--active' : ''}`}
                        onClick={() => {
                          onTypeChange(type.id);
                          onCategoryChange(category._id);
                        }}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        <span className="category-nav__item-icon">
                          <CategoryIconDisplay
                            icon={category.icon}
                            size={18}
                            categoryType={type.id}
                          />
                        </span>
                        <span className="category-nav__item-body">
                          <span className="category-nav__item-name">{category.name}</span>
                          <span className="category-nav__item-count">{count}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {categories.length === 0 && (
          <p className="category-nav__empty">No categories yet. Create categories first.</p>
        )}
      </nav>

      <div className="category-nav-mobile" role="tablist" aria-label="Category types">
        {CATEGORY_TYPES.map((type) => {
          const isActive = activeType === type.id;
          const typeCount = (categoriesByType[type.id] || []).length;
          if (typeCount === 0) return null;
          return (
            <button
              key={type.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`category-nav-mobile__type-chip ${isActive ? 'category-nav-mobile__type-chip--active' : ''}`}
              onClick={() => onTypeChange(type.id)}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      <div
        className="category-nav-mobile__categories"
        role="tablist"
        aria-label="Categories"
      >
        {mobileCategories.map((category) => {
          const isActive = activeCategoryId === category._id;
          const count = countsByCategory[category._id] ?? 0;
          return (
            <button
              key={category._id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`category-nav-mobile__cat-chip ${isActive ? 'category-nav-mobile__cat-chip--active' : ''}`}
              onClick={() => onCategoryChange(category._id)}
            >
              <CategoryIconDisplay
                icon={category.icon}
                size={16}
                categoryType={activeType}
              />
              <span>{category.name}</span>
              <span className="category-nav-mobile__cat-count">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;
