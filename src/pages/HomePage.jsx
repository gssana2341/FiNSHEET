import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import './HomePage.css';

const ONBOARDING_SLIDES = [
  {
    id: 'explore',
    image: '/hero_study.png',
    title: 'Ace Your Exams',
    desc: 'Access thousands of premium study notes from top students across various universities.'
  },
  {
    id: 'ai',
    image: '/ai_summary.png',
    title: 'Your AI Copilot',
    desc: 'Upload heavy PDFs and let our AI instantly generate flashcards and bite-sized notes.'
  },
  {
    id: 'earn',
    image: '/marketplace_shop_1775463350161.png', // Assuming we have some image, fallback if missing
    title: 'Earn While You Learn',
    desc: 'Turn your hard work into passive income by selling your beautifully crafted sheets.'
  }
];

export default function HomePage({ onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Go to register
      onNavigate('register'); // We will intercept this in App.jsx
    }
  };

  const handleSkip = () => {
    onNavigate('login');
  };

  return (
    <div className="app-onboarding" id="home-page">
      <div className="onboarding-skip-row">
        {currentSlide < ONBOARDING_SLIDES.length - 1 ? (
          <button className="onboarding-skip-btn" onClick={handleSkip}>
            Skip
          </button>
        ) : (
          <div /> // placeholder for flex space
        )}
      </div>

      <div className="onboarding-content">
        <div className="onboarding-illustration">
          <img 
            src={ONBOARDING_SLIDES[currentSlide].image} 
            alt={ONBOARDING_SLIDES[currentSlide].title} 
            onError={(e) => {
              // fallback if image not found
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="fallback-icon">📱</div>';
            }}
          />
        </div>

        <div className="onboarding-text">
          <div className="onboarding-indicators">
            {ONBOARDING_SLIDES.map((_, idx) => (
              <div 
                key={idx} 
                className={`indicator-dot ${idx === currentSlide ? 'active' : ''}`}
              />
            ))}
          </div>
          <h1>{ONBOARDING_SLIDES[currentSlide].title}</h1>
          <p>{ONBOARDING_SLIDES[currentSlide].desc}</p>
        </div>
      </div>

      <div className="onboarding-actions">
        {currentSlide === ONBOARDING_SLIDES.length - 1 ? (
          <div className="onboarding-final-actions animate-fade-in">
            <Button variant="primary" fullWidth size="lg" onClick={() => onNavigate('login')}>
              Log In
            </Button>
            <p className="onboarding-login-hint">
              New to FiNSHEET? <button onClick={() => onNavigate('register')}>Sign Up</button>
            </p>
          </div>
        ) : (
          <div className="onboarding-nav-actions">
            <Button variant="primary" className="onboarding-next-btn" onClick={handleNext}>
              Next <ChevronRight size={20} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
