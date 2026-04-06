import { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { t, getLang, setLang, onLangChange } from '../i18n';
import './AuthPages.css';

export default function ForgotPasswordPage({ onGoToLogin }) {
  const [, setLangTick] = useState(0);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return onLangChange(() => setLangTick((n) => n + 1));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) { setError(t('auth.requiredField')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(t('auth.invalidEmail')); return; }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="auth-page" id="forgot-password-page">
      <div className="auth-bg-decor">
        <div className="auth-bg-circle auth-bg-circle--1" />
        <div className="auth-bg-circle auth-bg-circle--2" />
        <div className="auth-bg-circle auth-bg-circle--3" />
      </div>

      <div className="auth-container auth-container--single">
        <div className="auth-form-panel auth-form-panel--full">
          <button className="auth-lang-toggle" onClick={() => setLang(getLang() === 'en' ? 'th' : 'en')}>
            🌐 {getLang().toUpperCase()}
          </button>

          <div className="auth-form-wrapper auth-form-wrapper--narrow">
            {/* Back Button */}
            <button className="auth-back-btn" onClick={onGoToLogin}>
              <ArrowLeft size={18} />
              <span>{t('auth.backToLogin')}</span>
            </button>

            {/* Logo */}
            <div className="auth-form-logo-center">
              <div className="auth-brand-logo">F</div>
            </div>

            {!isSent ? (
              <>
                <div className="auth-form-header auth-form-header--center">
                  <h2 className="auth-form-title">{t('auth.forgotTitle')}</h2>
                  <p className="auth-form-subtitle">{t('auth.forgotSubtitle')}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
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
                        id="forgot-email"
                      />
                    </div>
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  <button type="submit" className="auth-submit-btn" disabled={isLoading} id="forgot-submit">
                    {isLoading ? (
                      <div className="auth-spinner" />
                    ) : (
                      <>
                        <Send size={18} />
                        <span>{t('auth.sendResetLink')}</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="auth-reset-success">
                <div className="auth-reset-success-icon">
                  <CheckCircle size={56} />
                </div>
                <h2 className="auth-form-title">{t('auth.resetSent')}</h2>
                <p className="auth-form-subtitle">
                  We sent a password reset link to <strong>{email}</strong>
                </p>
                <button className="auth-submit-btn auth-submit-btn--secondary" onClick={onGoToLogin}>
                  <ArrowLeft size={18} />
                  <span>{t('auth.backToLogin')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
