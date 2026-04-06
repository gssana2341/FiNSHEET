import { useState, useEffect, useRef } from 'react';
import { Copy, RefreshCw, Brain, Layers, Save, Store } from 'lucide-react';
import { t } from '../../i18n';
import './StreamingOutput.css';

const LOADING_MESSAGES = [
  'Reading your content...',
  'Analyzing key concepts...',
  'Organizing main ideas...',
  'Making it easy to understand...',
  'Almost done...',
];

export default function StreamingOutput({
  text = '',
  isStreaming = false,
  onGenerateQuiz = () => {},
  onGenerateFlashcards = () => {},
  onSave = () => {},
  onSell = () => {},
  showActions = false,
}) {
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef(null);

  // Rotate loading messages
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [text, isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="streaming-output" id="streaming-output">
      {/* Loading State */}
      {isStreaming && !text && (
        <div className="streaming-loading">
          <div className="streaming-loading-animation">
            <div className="streaming-dot" />
            <div className="streaming-dot" />
            <div className="streaming-dot" />
          </div>
          <p className="streaming-loading-msg" key={loadingMsgIdx}>
            ✨ {LOADING_MESSAGES[loadingMsgIdx]}
          </p>
        </div>
      )}

      {/* Content Area */}
      {text && (
        <div className="streaming-content" ref={contentRef}>
          <div className="streaming-text">
            {text}
            {isStreaming && <span className="streaming-cursor">|</span>}
          </div>

          {/* Copy Button */}
          {!isStreaming && (
            <button className="streaming-copy-btn" onClick={handleCopy}>
              <Copy size={14} />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!text && !isStreaming && (
        <div className="streaming-empty">
          <div className="streaming-empty-icon">📝</div>
          <p>Upload a file or paste text to generate an AI summary</p>
          <span>Your summary will appear here with streaming output</span>
        </div>
      )}

      {/* Post-Summary Actions */}
      {showActions && text && !isStreaming && (
        <div className="streaming-actions">
          <button className="streaming-action-btn streaming-action-btn--quiz" onClick={onGenerateQuiz}>
            <Brain size={18} />
            <span>Generate Quiz</span>
          </button>
          <button className="streaming-action-btn streaming-action-btn--flash" onClick={onGenerateFlashcards}>
            <Layers size={18} />
            <span>Flashcards</span>
          </button>
          <button className="streaming-action-btn streaming-action-btn--save" onClick={onSave}>
            <Save size={18} />
            <span>Save</span>
          </button>
          <button className="streaming-action-btn streaming-action-btn--sell" onClick={onSell}>
            <Store size={18} />
            <span>Sell</span>
          </button>
        </div>
      )}
    </div>
  );
}
