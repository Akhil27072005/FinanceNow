import React from 'react';
import { Icon } from '@iconify/react';
import { ArrowUp, ArrowDown, ArrowLeftRight } from 'lucide-react';

const BAR_HEIGHTS = ['35%', '55%', '72%', '100%', '48%', '62%'];
const HIGHLIGHT_INDEX = 3;

/**
 * Static dashboard illustration for the landing hero (right column).
 */
const LandingHeroMockup = () => {
  return (
    <div className="landing-mockup" aria-hidden="true">
      <div className="landing-mockup__chrome">
        <span className="landing-mockup__dot landing-mockup__dot--red" />
        <span className="landing-mockup__dot landing-mockup__dot--yellow" />
        <span className="landing-mockup__dot landing-mockup__dot--green" />
      </div>

      <div className="landing-mockup__cards">
        <div className="landing-mockup__card-netflix">
          <div className="landing-mockup__card-brand">
            <Icon icon="logos:netflix-icon" style={{ fontSize: 40 }} />
            <div>
              <div className="landing-mockup__card-label">Netflix</div>
              <div className="landing-mockup__card-price">$24/month</div>
            </div>
          </div>
        </div>

        <div className="landing-mockup__card-spotify">
          <span className="landing-mockup__toggle" aria-hidden />
          <div className="landing-mockup__card-brand">
            <Icon icon="logos:spotify-icon" style={{ fontSize: 48, color: '#fff' }} />
            <div>
              <div className="landing-mockup__card-label">Spotify</div>
              <div className="landing-mockup__card-price">$13/month</div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="landing-mockup__balance-title">My Balance</h3>
      <p className="landing-mockup__balance-amount">$9,823.28</p>
      <p className="landing-mockup__balance-note">
        You made an extra $2,832.19 in this month.
      </p>

      <div className="landing-mockup__actions">
        <div className="landing-mockup__action">
          <span className="landing-mockup__action-icon">
            <ArrowUp size={22} strokeWidth={2.5} />
          </span>
          <span className="landing-mockup__action-label">Send</span>
        </div>
        <div className="landing-mockup__action">
          <span className="landing-mockup__action-icon">
            <ArrowDown size={22} strokeWidth={2.5} />
          </span>
          <span className="landing-mockup__action-label">Receive</span>
        </div>
        <div className="landing-mockup__action">
          <span className="landing-mockup__action-icon">
            <ArrowLeftRight size={22} strokeWidth={2.5} />
          </span>
          <span className="landing-mockup__action-label">Convert</span>
        </div>
      </div>

      <div className="landing-mockup__chart">
        <div className="landing-mockup__y-axis">
          <span>150K</span>
          <span>125K</span>
          <span>100K</span>
        </div>
        <div className="landing-mockup__bars">
          {BAR_HEIGHTS.map((height, index) => (
            <div
              key={index}
              className={`landing-mockup__bar ${
                index === HIGHLIGHT_INDEX ? 'landing-mockup__bar--highlight' : ''
              }`}
              style={{ height }}
            >
              {index === HIGHLIGHT_INDEX && (
                <span className="landing-mockup__tooltip">$4,239.12</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingHeroMockup;
