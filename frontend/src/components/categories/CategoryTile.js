import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import CategoryIconDisplay from './CategoryIconDisplay';
import { CATEGORY_TYPE_ACCENTS } from '../../constants/categoryIcons';

const CategoryTile = ({ category, onEdit, onDelete }) => {
  const accent = CATEGORY_TYPE_ACCENTS[category.type] || CATEGORY_TYPE_ACCENTS.expense;

  return (
    <article
      className="category-tile glass-tile"
      style={{
        '--category-accent-border': accent.border,
        '--category-accent-bg': accent.bg
      }}
    >
      <div className="category-tile__icon-wrap">
        <CategoryIconDisplay icon={category.icon} size={28} categoryType={category.type} />
      </div>
      <h3 className="category-tile__name" title={category.name}>
        {category.name}
      </h3>
      <div className="category-tile__actions">
        <button
          type="button"
          className="category-tile__action category-tile__action--edit"
          onClick={() => onEdit(category)}
          aria-label={`Edit ${category.name}`}
        >
          <Pencil size={15} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          className="category-tile__action category-tile__action--delete"
          onClick={() => onDelete(category._id)}
          aria-label={`Delete ${category.name}`}
        >
          <Trash2 size={15} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </article>
  );
};

export default CategoryTile;
