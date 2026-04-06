import { useState } from 'react';
import { Search, MapPin, CheckCircle, ChevronRight } from 'lucide-react';
import Button from './Button';
import './OnboardingPopup.css';

const MOCK_INSTITUTIONS = [
  'Chulalongkorn University',
  'Thammasat University',
  'Mahidol University',
  'Kasetsart University',
  'Chiang Mai University',
  'King Mongkut\'s Institute of Technology Ladkrabang (KMITL)',
  'Bangkok University',
  'ABAC'
];

export default function OnboardingPopup({ onComplete }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  
  const filtered = MOCK_INSTITUTIONS.filter(inst => 
    inst.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = () => {
    if (selected) {
      onComplete(selected);
    }
  };

  return (
    <div className="onboard-overlay">
      <div className="onboard-modal">
        <div className="onboard-header">
          <div className="onboard-icon-wrap">
            <MapPin size={24} />
          </div>
          <h2>Where do you study?</h2>
          <p>We'll personalize your marketplace to show notes from your institution first.</p>
        </div>

        <div className="onboard-search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search university or school..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="onboard-list">
          {filtered.length > 0 ? (
            filtered.map((inst, idx) => (
              <button 
                key={idx} 
                className={`onboard-list-item ${selected === inst ? 'selected' : ''}`}
                onClick={() => setSelected(inst)}
              >
                <span>{inst}</span>
                {selected === inst && <CheckCircle size={18} className="check-icon" />}
              </button>
            ))
          ) : (
            <div className="onboard-empty">
              No matches found.
            </div>
          )}
        </div>

        <div className="onboard-footer">
          <Button 
            variant="primary" 
            fullWidth 
            disabled={!selected}
            icon={ChevronRight}
            onClick={handleSubmit}
          >
            Continue to Explore
          </Button>
          <button className="onboard-skip" onClick={() => onComplete('Unknown')}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
