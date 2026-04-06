import { Trophy, Medal } from 'lucide-react';
import './Leaderboard.css';

const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ users = [], currentUserId = '' }) {
  if (!users.length) return null;

  return (
    <div className="leaderboard" id="leaderboard">
      <div className="leaderboard-header">
        <Trophy size={18} />
        <h3>Weekly Leaderboard</h3>
        <span className="leaderboard-reset">Resets Monday</span>
      </div>

      <div className="leaderboard-list">
        {users.map((user, i) => {
          const isCurrentUser = user.id === currentUserId;
          const rank = i + 1;
          return (
            <div
              key={user.id}
              className={`leaderboard-item ${isCurrentUser ? 'leaderboard-item--current' : ''} ${rank <= 3 ? 'leaderboard-item--top' : ''}`}
            >
              <span className="leaderboard-rank">
                {rank <= 3 ? medals[rank - 1] : `#${rank}`}
              </span>
              <div className="leaderboard-avatar">
                {user.displayName.charAt(0)}
              </div>
              <span className="leaderboard-name">
                {user.displayName}
                {isCurrentUser && <span className="leaderboard-you">(You)</span>}
              </span>
              <span className="leaderboard-minutes">{user.studyMinutes} min</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
