import React from 'react';
import { Plus } from 'lucide-react';
import SubcategoryTile from './SubcategoryTile';
import { CATEGORY_TYPES } from '../../constants/categoryIcons';

const SubcategoryTileGrid = ({
  subcategories,
  activeCategory,
  loading,
  onAdd,
  onEdit,
  onDelete
}) => {
  const typeMeta = activeCategory
    ? CATEGORY_TYPES.find((t) => t.id === activeCategory.type)
    : null;

  if (loading) {
    return (
      <div className="subcategory-tile-grid glass-panel">
        <div className="subcategory-tile-grid__loading">Loading subcategories…</div>
      </div>
    );
  }

  if (!activeCategory) {
    return (
      <div className="subcategory-tile-grid glass-panel">
        <div className="subcategory-tile-grid__empty">
          <p>Select a category to view subcategories, or create a category first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subcategory-tile-grid glass-panel">
      <div className="subcategory-tile-grid__header">
        <div>
          <h2 className="subcategory-tile-grid__title">{activeCategory.name}</h2>
          <p className="subcategory-tile-grid__subtitle">
            {typeMeta?.description ?? 'Subcategories under this category'}
          </p>
        </div>
        <button type="button" className="subcategory-tile-grid__add-btn" onClick={onAdd}>
          + Add subcategory
        </button>
      </div>

      {subcategories.length === 0 ? (
        <div className="subcategory-tile-grid__empty">
          <p>No subcategories in {activeCategory.name} yet.</p>
          <button type="button" className="subcategory-tile-grid__add-btn" onClick={onAdd}>
            Create your first subcategory
          </button>
        </div>
      ) : (
        <div className="subcategory-tile-grid__tiles">
          {subcategories.map((subcategory) => (
            <SubcategoryTile
              key={subcategory._id}
              subcategory={subcategory}
              parentType={activeCategory.type}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          <button
            type="button"
            className="subcategory-tile subcategory-tile--add glass-tile"
            onClick={onAdd}
            aria-label="Add subcategory"
          >
            <Plus size={28} strokeWidth={2} aria-hidden />
            <span>Add subcategory</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SubcategoryTileGrid;
