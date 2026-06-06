import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Shared glass card shell for dashboard list sections.
 */
const DashboardSectionCard = ({
  title,
  seeAllTo,
  seeAllLabel = 'See all >',
  children,
  className = ''
}) => (
  <div className={`dashboard-list-card glass-panel ${className}`.trim()}>
    <div className="dashboard-list-card__header">
      <h2 className="dashboard-list-card__title">{title}</h2>
      {seeAllTo ? (
        <Link to={seeAllTo} className="dashboard-list-card__see-all">
          {seeAllLabel}
        </Link>
      ) : null}
    </div>
    <div className="dashboard-list-card__body">{children}</div>
  </div>
);

export default DashboardSectionCard;
