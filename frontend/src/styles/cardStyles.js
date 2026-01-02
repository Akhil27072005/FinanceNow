/**
 * Shared card styling to match the design system
 * Fintech SaaS style - heavy, anchored cards
 */
export const cardStyle = {
  border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  transition: 'box-shadow 0.2s ease'
};

export const cardHoverStyle = {
  ...cardStyle,
  boxShadow: '0 12px 32px rgba(0,0,0,0.08)'
};

