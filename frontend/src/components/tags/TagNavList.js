import React from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import Select from '../ui/Select';

const SORT_OPTIONS = [
  { value: 'amount', label: 'Sort by spend' },
  { value: 'count', label: 'Sort by usage' },
  { value: 'name', label: 'Sort by name' }
];

const TagNavList = ({
  tags,
  activeTagId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  statsByTagId = {},
  loading
}) => {
  return (
    <aside className="tag-nav glass-panel">
      <div className="tag-nav__toolbar">
        <input
          type="search"
          className="tag-nav__search form-control"
          placeholder="Search tags…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tags"
        />
        <Select
          glass
          className="tag-nav__sort-wrap"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          options={SORT_OPTIONS}
          aria-label="Sort tags"
        />
      </div>

      <button type="button" className="tag-nav__add" onClick={onAdd}>
        <Plus size={16} strokeWidth={2} aria-hidden />
        Add tag
      </button>

      {loading ? (
        <div className="tag-nav__loading">Loading tags…</div>
      ) : tags.length === 0 ? (
        <p className="tag-nav__empty">No tags match your search.</p>
      ) : (
        <ul className="tag-nav__list">
          {tags.map((tag) => {
            const stats = statsByTagId[tag._id] || {};
            const isActive = activeTagId === tag._id;
            return (
              <li key={tag._id}>
                <div
                  className={`tag-nav__item ${isActive ? 'tag-nav__item--active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(tag._id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(tag._id);
                    }
                  }}
                >
                  <span
                    className="tag-nav__swatch"
                    style={{ backgroundColor: tag.color || '#9ca3af' }}
                    aria-hidden
                  />
                  <span className="tag-nav__body">
                    <span className="tag-nav__name">{tag.name}</span>
                    <span className="tag-nav__meta">
                      <span className="tag-nav__amount">
                        {stats.amount != null ? stats.amountLabel : '—'}
                      </span>
                      <span className="tag-nav__count">{stats.count ?? 0} txns</span>
                    </span>
                  </span>
                </div>
                <div className="tag-nav__actions">
                  <button
                    type="button"
                    className="tag-nav__action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(tag);
                    }}
                    aria-label={`Edit ${tag.name}`}
                  >
                    <Pencil size={14} strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="tag-nav__action tag-nav__action--delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(tag._id);
                    }}
                    aria-label={`Delete ${tag.name}`}
                  >
                    <Trash2 size={14} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
};

export default TagNavList;
