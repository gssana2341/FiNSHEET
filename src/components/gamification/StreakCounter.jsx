import { Flame } from 'lucide-react';
import './StreakCounter.css';

export default function StreakCounter({ days = 0 }) {
  return (
    <div className="streak-counter" id="streak-counter">
      <div className="streak-flame">
        <Flame size={18} />
      </div>
      <span className="streak-days">{days}</span>
    </div>
  );
}
