import { Flame, Clock, Award } from 'lucide-react';
import { t } from '../../i18n';
import './StreakPopover.css';

export default function StreakPopover({ days, studyMinutes, goalMinutes, onClose }) {
  const progress = Math.min(100, (studyMinutes / goalMinutes) * 100);

  return (
    <div className="streak-popover animate-fade-in" id="streak-popover">
      <div className="streak-popover-header">
        <div className="streak-popover-flame">
          <Flame size={24} fill="#F97316" color="#F97316" />
        </div>
        <div className="streak-popover-count">
          <span className="count-number">{days}</span>
          <span className="count-label">{t('home.streakLabel')}</span>
        </div>
      </div>

      <div className="streak-popover-body">
        <div className="streak-goal-progress">
          <div className="goal-label">
            <Clock size={14} />
            <span>{t('home.studyGoal')}</span>
            <span className="goal-values">{studyMinutes}/{goalMinutes} {t('home.daysLeft').replace('วัน', 'นาที')}</span>
          </div>
          <div className="goal-track">
            <div className="goal-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="streak-activity">
          <span className="activity-label">Weekly Activity</span>
          <div className="activity-dots">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <div 
                key={d} 
                className={`activity-dot ${d <= (days % 7) || d === 1 ? 'activity-dot--active' : ''}`} 
                title={`Day ${d}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="streak-popover-footer">
        <Award size={14} />
        <span>Keep it up, Alex! 🔥</span>
      </div>
    </div>
  );
}
