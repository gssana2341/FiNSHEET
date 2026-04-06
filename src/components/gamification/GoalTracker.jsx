import { Calendar, Target } from 'lucide-react';
import './GoalTracker.css';

export default function GoalTracker({ goal = '', examDate = '', progress = 0 }) {
  let daysLeft = 0;
  if (examDate) {
    const diff = new Date(examDate) - new Date();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const progressPct = Math.min(100, Math.max(0, progress));

  return (
    <div className="goal-tracker" id="goal-tracker">
      <div className="goal-tracker-header">
        <div className="goal-tracker-icon">
          <Target size={20} />
        </div>
        <div className="goal-tracker-info">
          <span className="goal-tracker-label">Study Goal</span>
          <span className="goal-tracker-value">{goal || 'Set your goal'}</span>
        </div>
      </div>

      {examDate && (
        <div className="goal-tracker-countdown">
          <Calendar size={14} />
          <span className="goal-tracker-days">
            <strong>{daysLeft}</strong> days until exam
          </span>
          <span className="goal-tracker-date">{examDate}</span>
        </div>
      )}

      <div className="goal-tracker-progress">
        <div className="goal-tracker-progress-header">
          <span>Progress</span>
          <span className="goal-tracker-pct">{progressPct}%</span>
        </div>
        <div className="goal-tracker-bar">
          <div className="goal-tracker-bar-fill" style={{ width: `${progressPct}%` }}>
            {progressPct > 15 && <span className="goal-tracker-bar-text">{progressPct}%</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
