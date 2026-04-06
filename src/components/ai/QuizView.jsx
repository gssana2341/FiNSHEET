import { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import './QuizView.css';

export default function QuizView({ quiz = null, onComplete = () => {} }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  if (!quiz || !quiz.questions?.length) return null;

  const question = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;
  const optionLetters = ['A', 'B', 'C', 'D'];

  const handleSelect = (letter) => {
    if (showResult) return;
    setSelectedAnswer(letter);
    setShowResult(true);

    const isCorrect = letter === question.answer;
    setResults((prev) => [...prev, { questionId: question.id, selected: letter, correct: question.answer, isCorrect }]);
  };

  const handleNext = () => {
    if (currentIdx + 1 >= totalQuestions) {
      setIsFinished(true);
      onComplete(results);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setResults([]);
    setIsFinished(false);
  };

  const correctCount = results.filter((r) => r.isCorrect).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  if (isFinished) {
    return (
      <div className="quiz-view" id="quiz-view">
        <div className="quiz-finished">
          <div className={`quiz-score-circle ${scorePercent >= 60 ? 'quiz-score-circle--pass' : 'quiz-score-circle--fail'}`}>
            <span className="quiz-score-num">{scorePercent}%</span>
          </div>
          <h2 className="quiz-finished-title">
            {scorePercent >= 80 ? '🎉 Excellent!' : scorePercent >= 60 ? '👍 Good Job!' : '📖 Keep Studying!'}
          </h2>
          <p className="quiz-finished-stat">
            {correctCount} / {totalQuestions} correct
          </p>

          <div className="quiz-result-list">
            {results.map((r, i) => (
              <div key={i} className={`quiz-result-item ${r.isCorrect ? 'quiz-result-item--correct' : 'quiz-result-item--wrong'}`}>
                <span className="quiz-result-num">Q{i + 1}</span>
                {r.isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                <span className="quiz-result-detail">
                  {r.isCorrect ? 'Correct' : `Your: ${r.selected} → Answer: ${r.correct}`}
                </span>
              </div>
            ))}
          </div>

          <button className="quiz-restart-btn" onClick={handleRestart}>
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-view" id="quiz-view">
      {/* Progress */}
      <div className="quiz-progress">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }} />
        </div>
        <span className="quiz-progress-text">{currentIdx + 1} / {totalQuestions}</span>
      </div>

      {/* Question */}
      <div className="quiz-question" key={currentIdx}>
        <h3 className="quiz-question-text">{question.question}</h3>

        <div className="quiz-options">
          {question.options.map((option, i) => {
            const letter = optionLetters[i];
            const isSelected = selectedAnswer === letter;
            const isCorrectAnswer = question.answer === letter;
            let optionClass = 'quiz-option';

            if (showResult) {
              if (isCorrectAnswer) optionClass += ' quiz-option--correct';
              else if (isSelected && !isCorrectAnswer) optionClass += ' quiz-option--wrong';
            } else if (isSelected) {
              optionClass += ' quiz-option--selected';
            }

            return (
              <button
                key={letter}
                className={optionClass}
                onClick={() => handleSelect(letter)}
                disabled={showResult}
              >
                <span className="quiz-option-letter">{letter}</span>
                <span className="quiz-option-text">{option}</span>
                {showResult && isCorrectAnswer && <CheckCircle size={18} className="quiz-option-icon" />}
                {showResult && isSelected && !isCorrectAnswer && <XCircle size={18} className="quiz-option-icon" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && (
          <div className={`quiz-explanation ${selectedAnswer === question.answer ? 'quiz-explanation--correct' : 'quiz-explanation--wrong'}`}>
            <p><strong>{selectedAnswer === question.answer ? '✅ Correct!' : '❌ Incorrect'}</strong></p>
            <p>{question.explanation}</p>
          </div>
        )}

        {/* Next Button */}
        {showResult && (
          <button className="quiz-next-btn" onClick={handleNext}>
            <span>{currentIdx + 1 >= totalQuestions ? 'See Results' : 'Next Question'}</span>
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
