import React from 'react';
import { Plus } from 'lucide-react';
import CategoryTile from './CategoryTile';
import { CATEGORY_TYPES } from '../../constants/categoryIcons';

const CategoryTileGrid = ({
  categories,
  activeType,
  loading,
  onAdd,
  onEdit,
  onDelete
}) => {
  const typeMeta = CATEGORY_TYPES.find((t) => t.id === activeType);

  if (loading) {
    return (
      <div className="category-tile-grid glass-panel">
        <div className="category-tile-grid__loading">Loading categories…</div>
      </div>
    );
  }

  return (
    <div className="category-tile-grid glass-panel">
      <div className="category-tile-grid__header">
        <div>
          <h2 className="category-tile-grid__title">{typeMeta?.label ?? 'Categories'}</h2>
          <p className="category-tile-grid__subtitle">{typeMeta?.description}</p>
        </div>
        <button type="button" className="category-tile-grid__add-btn" onClick={onAdd}>
          + Add category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="category-tile-grid__empty">
          <p>No {typeMeta?.label?.toLowerCase() ?? 'categories'} yet.</p>
          <button type="button" className="category-tile-grid__add-btn" onClick={onAdd}>
            Create your first category
          </button>
        </div>
      ) : (
        <div className="category-tile-grid__tiles">
          {categories.map((category) => (
            <CategoryTile
              key={category._id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          <button
            type="button"
            className="category-tile category-tile--add glass-tile"
            onClick={onAdd}
            aria-label="Add category"
          >
            <Plus size={28} strokeWidth={2} aria-hidden />
            <span>Add category</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryTileGrid;
