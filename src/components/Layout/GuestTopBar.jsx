import { Globe } from 'lucide-react';
import { getLang, setLang } from '../../i18n';
import Button from '../ui/Button';
import './GuestTopBar.css';

export default function GuestTopBar({ onLogin, onRegister }) {
  const toggleLang = () => {
    setLang(getLang() === 'en' ? 'th' : 'en');
  };

  return (
    <header className="guest-topbar">
      <div className="guest-topbar-left">
        <div className="guest-brand-logo">F</div>
        <span className="guest-brand-text">FiNSHEET</span>
      </div>

      <div className="guest-topbar-right">
        <button className="guest-lang-toggle" onClick={toggleLang}>
          <Globe size={18} />
          <span>{getLang().toUpperCase()}</span>
        </button>

        <div className="guest-auth-actions">
          <Button variant="ghost" className="guest-login-btn" onClick={onLogin}>
            Log In
          </Button>
          <Button variant="primary" className="guest-signup-btn" onClick={onRegister}>
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}
