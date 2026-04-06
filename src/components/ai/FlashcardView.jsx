import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw } from 'lucide-react';
import './FlashcardView.css';

export default function FlashcardView({ cards = [] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [displayCards, setDisplayCards] = useState(cards);

  if (!displayCards.length) return null;

  const card = displayCards[currentIdx];

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handlePrev = () => {
    if (currentIdx > 0) {
      setIsFlipped(false);
      setCurrentIdx((i) => i - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < displayCards.length - 1) {
      setIsFlipped(false);
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleShuffle = () => {
    const shuffledCards = [...displayCards].sort(() => Math.random() - 0.5);
    setDisplayCards(shuffledCards);
    setCurrentIdx(0);
    setIsFlipped(false);
    setShuffled(true);
  };

  const handleReset = () => {
    setDisplayCards(cards);
    setCurrentIdx(0);
    setIsFlipped(false);
    setShuffled(false);
  };

  return (
    <div className="flashcard-view" id="flashcard-view">
      {/* Progress */}
      <div className="flashcard-progress">
        <div className="flashcard-progress-bar">
          <div className="flashcard-progress-fill" style={{ width: `${((currentIdx + 1) / displayCards.length) * 100}%` }} />
        </div>
        <span className="flashcard-progress-text">{currentIdx + 1} / {displayCards.length}</span>
      </div>

      {/* Card */}
      <div className="flashcard-container" onClick={handleFlip}>
        <div className={`flashcard-inner ${isFlipped ? 'flashcard-inner--flipped' : ''}`}>
          <div className="flashcard-front">
            <span className="flashcard-label">Term</span>
            <p className="flashcard-text">{card.term || card.front || 'Term'}</p>
            <span className="flashcard-hint">Tap to flip</span>
          </div>
          <div className="flashcard-back">
            <span className="flashcard-label">Definition</span>
            <p className="flashcard-text">{card.definition || card.back || 'Definition'}</p>
            <span className="flashcard-hint">Tap to flip back</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flashcard-controls">
        <button
          className="flashcard-nav-btn"
          onClick={handlePrev}
          disabled={currentIdx === 0}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flashcard-toolbar">
          <button className="flashcard-tool-btn" onClick={handleShuffle} title="Shuffle">
            <Shuffle size={16} />
          </button>
          <button className="flashcard-tool-btn" onClick={handleReset} title="Reset">
            <RotateCcw size={16} />
          </button>
        </div>

        <button
          className="flashcard-nav-btn"
          onClick={handleNext}
          disabled={currentIdx === displayCards.length - 1}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
