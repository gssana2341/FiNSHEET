import { useState } from 'react';
import './AchievementBadge.css';

export default function AchievementBadge({ name = '', icon = '🏅', description = '', unlocked = false }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`achievement ${unlocked ? 'achievement--unlocked' : 'achievement--locked'}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="achievement-icon-wrapper">
        <span className="achievement-icon">{icon}</span>
        {!unlocked && <div className="achievement-lock">🔒</div>}
      </div>
      <span className="achievement-name">{name}</span>

      {showTooltip && description && (
        <div className="achievement-tooltip">
          <p className="achievement-tooltip-name">{name}</p>
          <p className="achievement-tooltip-desc">{description}</p>
          {!unlocked && <p className="achievement-tooltip-status">Not yet unlocked</p>}
        </div>
      )}
    </div>
  );
}
