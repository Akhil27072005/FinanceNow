import React from 'react';

const MarketingScreenshot = ({ src, alt }) => (
  <div className="marketing-shot">
    <div className="marketing-shot__shell">
      <img src={src} alt={alt} className="marketing-shot__img" loading="lazy" decoding="async" />
    </div>
  </div>
);

export default MarketingScreenshot;
