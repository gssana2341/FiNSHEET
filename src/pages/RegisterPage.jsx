import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';
import { t, getLang, setLang, onLangChange } from '../i18n';
import './AuthPages.css';

export default function RegisterPage({ onRegister, onGoToLogin }) {
  const [, setLangTick] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToS, setAgreeToS] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return onLangChange(() => setLangTick((n) => n + 1));
  }, []);

  const validate = () => {
    if (!displayName.trim()) return t('auth.requiredField');
    if (!email.trim()) return t('auth.requiredField');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('auth.invalidEmail');
    if (password.length < 8) return t('auth.passwordMinLength');
    if (password !== confirmPassword) return t('auth.passwordMismatch');
    if (!agreeToS) return 'Please agree to the terms';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onRegister({ displayName, email });
    }, 1500);
  };

  const handleGoogleRegister = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onRegister({ displayName: 'Google User', email: 'google_user@gmail.com', provider: 'google' });
    }, 1500);
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-bg-decor">
        <div className="auth-bg-circle auth-bg-circle--1" />
        <div className="auth-bg-circle auth-bg-circle--2" />
        <div className="auth-bg-circle auth-bg-circle--3" />
      </div>

      <div className="auth-container">
        {/* Brand Panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-logo">F</div>
            <h1 className="auth-brand-name">FiNSHEET</h1>
            <p className="auth-brand-tagline">{t('tagline')}</p>
            <div className="auth-brand-features">
              <div className="auth-brand-feature">
                <span>📄</span>
                <span>AI-powered summaries</span>
              </div>
              <div className="auth-brand-feature">
                <span>🧪</span>
                <span>Smart quizzes & flashcards</span>
              </div>
              <div className="auth-brand-feature">
                <span>💰</span>
                <span>Sell your study notes</span>
              </div>
              <div className="auth-brand-feature">
                <span>🔥</span>
                <span>Study streaks & rewards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="auth-form-panel">
          <button className="auth-lang-toggle" onClick={() => setLang(getLang() === 'en' ? 'th' : 'en')}>
            🌐 {getLang().toUpperCase()}
          </button>

          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2 className="auth-form-title">{t('auth.registerTitle')}</h2>
              <p className="auth-form-subtitle">{t('auth.registerSubtitle')}</p>
            </div>

            {/* Google Sign Up */}
            <button className="auth-google-btn" onClick={handleGoogleRegister} disabled={isLoading} id="google-register-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{t('auth.continueWithGoogle')}</span>
            </button>

            <div className="auth-divider"><span>{t('auth.orContinueWith')}</span></div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">{t('auth.displayName')}</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Alex Johnson"
                    value={displayName}
                    onChange={(e) => { setDisplayName(e.target.value); setError(''); }}
                    id="register-name"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">{t('auth.email')}</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="alex@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                    id="register-email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">{t('auth.password')}</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    autoComplete="new-password"
                    id="register-password"
                  />
                  <button type="button" className="auth-input-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password && password.length < 8 && (
                  <span className="auth-field-hint auth-field-hint--error">{t('auth.passwordMinLength')}</span>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label">{t('auth.confirmPassword')}</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    autoComplete="new-password"
                    id="register-confirm-password"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span className="auth-field-hint auth-field-hint--error">{t('auth.passwordMismatch')}</span>
                )}
              </div>

              {/* Terms */}
              <label className="auth-terms">
                <input type="checkbox" checked={agreeToS} onChange={(e) => setAgreeToS(e.target.checked)} />
                <span className="auth-checkbox" />
                <span>
                  {t('auth.termsAgree')} <a href="#" className="auth-terms-link">{t('auth.terms')}</a> {t('auth.and')} <a href="#" className="auth-terms-link">{t('auth.privacy')}</a>
                </span>
              </label>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-submit-btn" disabled={isLoading} id="register-submit">
                {isLoading ? (
                  <div className="auth-spinner" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>{t('auth.register')}</span>
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch">
              {t('auth.hasAccount')}{' '}
              <button type="button" className="auth-switch-link" onClick={onGoToLogin}>
                {t('auth.signIn')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
