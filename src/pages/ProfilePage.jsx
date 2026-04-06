import { useState, useEffect } from 'react';
import { User, Target, Trophy, Moon, Globe, Bell, Wallet, LogOut, Clock } from 'lucide-react';
import { t, getLang, setLang, onLangChange } from '../i18n';
import { currentUser, achievements, leaderboardUsers } from '../data/mockUsers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StreakCounter from '../components/gamification/StreakCounter';
import GoalTracker from '../components/gamification/GoalTracker';
import Leaderboard from '../components/gamification/Leaderboard';
import AchievementBadge from '../components/gamification/AchievementBadge';
import { useCart } from '../context/CartContext';
import './ProfilePage.css';

export default function ProfilePage({ onLogout = () => {} }) {
  const [, setLangTick] = useState(0);
  const { clearCart } = useCart();

  useEffect(() => {
    return onLangChange(() => setLangTick((n) => n + 1));
  }, []);

  const handleLogout = () => {
    clearCart();
    onLogout();
  };

  const handleToggleLang = () => {
    setLang(getLang() === 'en' ? 'th' : 'en');
  };

  return (
    <div className="profile-page" id="profile-page">
      {/* Profile Hero Section */}
      <section className="profile-hero">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-lg">
            {currentUser.displayName.charAt(0)}
          </div>
          <button className="profile-avatar-edit" title={t('profile.editProfile')}>
            <User size={16} />
          </button>
        </div>
        <div className="profile-names">
          <h1 className="profile-display-name">{currentUser.displayName}</h1>
          <p className="profile-email">{currentUser.email}</p>
        </div>
        <Button variant="secondary" size="sm" id="edit-profile-btn">
          {t('profile.editProfile')}
        </Button>
      </section>

      {/* Stats Dashboard */}
      <section className="profile-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={20} />
          </div>
          <span className="stat-value">{currentUser.totalStudyMinutes}</span>
          <span className="stat-label">Min Studied</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Trophy size={20} />
          </div>
          <span className="stat-value">{currentUser.summariesCreated}</span>
          <span className="stat-label">Summaries</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={20} />
          </div>
          <span className="stat-value">{currentUser.quizzesCompleted}</span>
          <span className="stat-label">Quizzes</span>
        </div>
      </section>

      {/* Goal & Progress */}
      <section className="profile-goal-group">
        <h2 className="section-title">{t('profile.studyGoal')}</h2>
        <GoalTracker
          goal={currentUser.examGoal}
          examDate={currentUser.examDate}
          progress={65}
        />
      </section>

      {/* Achievements Horizontal Scroll */}
      <section className="profile-achievements-group">
        <h2 className="section-title">{t('profile.achievements')}</h2>
        <div className="profile-achievements-list">
          {achievements.map((a) => (
            <AchievementBadge
              key={a.id}
              name={a.name}
              icon={a.icon}
              description={a.description}
              unlocked={a.unlocked}
            />
          ))}
        </div>
      </section>

      {/* Settings List */}
      <section className="profile-settings-group">
        <h2 className="section-title">{t('profile.settings')}</h2>
        <Card variant="outlined" padding="none" className="settings-card">
          <div className="settings-list">
            <button className="settings-item">
              <span className="settings-icon"><Moon size={20} /></span>
              <div className="settings-content">
                <span className="settings-label">{t('profile.darkMode')}</span>
                <span className="settings-sub">Turn on dark theme</span>
              </div>
              <span className="settings-meta">{t('profile.comingSoon')}</span>
            </button>

            <button className="settings-item" onClick={handleToggleLang}>
              <span className="settings-icon"><Globe size={20} /></span>
              <div className="settings-content">
                <span className="settings-label">{t('profile.language')}</span>
                <span className="settings-sub">Change application language</span>
              </div>
              <span className="settings-meta">{getLang().toUpperCase()}</span>
            </button>

            <button className="settings-item">
              <span className="settings-icon"><Bell size={20} /></span>
              <div className="settings-content">
                <span className="settings-label">{t('profile.notifications')}</span>
                <span className="settings-sub">Push and email alerts</span>
              </div>
              <span className="settings-meta">{t('profile.comingSoon')}</span>
            </button>

            <button className="settings-item">
              <span className="settings-icon"><Wallet size={20} /></span>
              <div className="settings-content">
                <span className="settings-label">{t('profile.wallet')}</span>
                <span className="settings-sub">Manage your wallet and payments</span>
              </div>
              <span className="settings-meta">฿{(currentUser.creditBalance / 100).toFixed(0)}</span>
            </button>
          </div>
        </Card>
      </section>

      {/* Leaderboard */}
      <section className="profile-leaderboard-group">
        <h2 className="section-title">Weekly Leaderboard</h2>
        <Leaderboard users={leaderboardUsers} currentUserId={currentUser.id} />
      </section>

      <div className="profile-actions">
        <Button variant="ghost" fullWidth icon={LogOut} className="profile-logout" id="logout-btn" onClick={handleLogout}>
          {t('profile.logout')}
        </Button>
      </div>
    </div>
  );
}
