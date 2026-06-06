import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import CategoryIconDisplay from '../categories/CategoryIconDisplay';
import { CATEGORY_TYPE_ACCENTS } from '../../constants/categoryIcons';

const SubcategoryTile = ({ subcategory, parentType = 'expense', onEdit, onDelete }) => {
  const accent = CATEGORY_TYPE_ACCENTS[parentType] || CATEGORY_TYPE_ACCENTS.expense;

  return (
    <article
      className="subcategory-tile glass-tile"
      style={{
        '--subcategory-accent-border': accent.border,
        '--subcategory-accent-bg': accent.bg
      }}
    >
      <div className="subcategory-tile__icon-wrap">
        <CategoryIconDisplay
          icon={subcategory.icon}
          size={28}
          categoryType={parentType}
        />
      </div>
      <h3 className="subcategory-tile__name" title={subcategory.name}>
        {subcategory.name}
      </h3>
      <div className="subcategory-tile__actions">
        <button
          type="button"
          className="subcategory-tile__action subcategory-tile__action--edit"
          onClick={() => onEdit(subcategory)}
          aria-label={`Edit ${subcategory.name}`}
        >
          <Pencil size={15} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          className="subcategory-tile__action subcategory-tile__action--delete"
          onClick={() => onDelete(subcategory._id)}
          aria-label={`Delete ${subcategory.name}`}
        >
          <Trash2 size={15} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </article>
  );
};

export default SubcategoryTile;
