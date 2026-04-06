import { useState, useEffect } from 'react';
import { onLangChange } from './i18n';
import TopBar from './components/Layout/TopBar';
import BottomTabBar from './components/Layout/BottomTabBar';
import GuestTopBar from './components/Layout/GuestTopBar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import LibraryPage from './pages/LibraryPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingPopup from './components/ui/OnboardingPopup';
import NoteEditor from './components/editing/NoteEditor';
import { CartProvider } from './context/CartContext';
import './App.css';

// Check localStorage for existing session
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('finsheet_auth');
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
};

export default function App() {
  const [, setLangTick] = useState(0);
  const [authState, setAuthState] = useState(() => getStoredAuth()); // null = not logged in
  const [authView, setAuthView] = useState('landing'); // landing | login | register | forgot
  const [activePage, setActivePage] = useState('explore'); 
  const [editingItem, setEditingItem] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    return onLangChange(() => setLangTick((n) => n + 1));
  }, []);

  // When authState changes to logged in, trigger onboarding if no institution
  useEffect(() => {
    if (authState?.isLoggedIn && !authState.institution) {
      setShowOnboarding(true);
    }
  }, [authState]);

  // Global navigation listener
  useEffect(() => {
    const handleNav = (e) => setActivePage(e.detail);
    window.addEventListener('app-navigate', handleNav);
    return () => window.removeEventListener('app-navigate', handleNav);
  }, []);

  // Handle Login
  const handleLogin = (userData) => {
    const session = {
      isLoggedIn: true,
      username: userData.username || userData.email,
      provider: userData.provider || 'email',
      loginTime: new Date().toISOString(),
      institution: null, // Force onboarding
    };
    localStorage.setItem('finsheet_auth', JSON.stringify(session));
    setAuthState(session);
    setActivePage('explore');
  };

  // Handle Register
  const handleRegister = (userData) => {
    const session = {
      isLoggedIn: true,
      username: userData.email,
      displayName: userData.displayName,
      provider: userData.provider || 'email',
      loginTime: new Date().toISOString(),
      institution: null,
    };
    localStorage.setItem('finsheet_auth', JSON.stringify(session));
    setAuthState(session);
    setActivePage('explore');
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('finsheet_auth');
    setAuthState(null);
    setAuthView('landing');
  };

  const handleOnboardingComplete = (institution) => {
    const updatedSession = { ...authState, institution };
    localStorage.setItem('finsheet_auth', JSON.stringify(updatedSession));
    setAuthState(updatedSession);
    setShowOnboarding(false);
  };

  // ── UNAUTHENTICATED ROUTING ──
  if (!authState || !authState.isLoggedIn) {
    if (authView === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onGoToRegister={() => setAuthView('register')}
          onGoToForgot={() => setAuthView('forgot')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onGoToLogin={() => setAuthView('login')}
        />
      );
    }
    if (authView === 'forgot') {
      return (
        <ForgotPasswordPage
          onGoToLogin={() => setAuthView('login')}
        />
      );
    }
    
    // Default: 'landing' (HomePage)
    return (
      <HomePage onNavigate={(target) => {
        if (target === 'login') setAuthView('login');
        if (target === 'register') setAuthView('register');
      }} />
    );
  }

  // ── AUTHENTICATED ROUTING ──
  const renderPage = () => {
    switch (activePage) {
      case 'explore':
        return <ExplorePage />;
      case 'library':
        return <LibraryPage onOpenEditor={setEditingItem} />;
      case 'cart':
        return <CartPage />;
      case 'profile':
        return <ProfilePage onLogout={handleLogout} />;
      default:
        return <ExplorePage />;
    }
  };

  if (editingItem) {
    return (
      <NoteEditor 
        item={editingItem} 
        onClose={() => setEditingItem(null)} 
        isTablet={window.innerWidth > 768} 
      />
    );
  }

  return (
    <CartProvider>
      <div className="app-layout" id="app-root">
        <TopBar activePage={activePage} onNavigate={setActivePage} />
        <main className="app-main">
          <div className="app-content" key={activePage}>
            {renderPage()}
          </div>
        </main>
        <BottomTabBar activePage={activePage} onNavigate={setActivePage} />
        
        {showOnboarding && <OnboardingPopup onComplete={handleOnboardingComplete} />}
      </div>
    </CartProvider>
  );
}
