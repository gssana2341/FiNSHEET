import { useState, useRef } from 'react';
import { Upload, FileText, Image, Type, X, CheckCircle } from 'lucide-react';
import { t } from '../../i18n';
import './FileUploadArea.css';

const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/heic': 'HEIC',
};
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileUploadArea({ onFileSelect = () => {}, onTextSubmit = () => {} }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('upload'); // upload | text
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      return 'Unsupported file type. Please upload PDF, JPG, PNG, or HEIC.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 50MB.';
    }
    return null;
  };

  const handleFile = (file) => {
    setError('');
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTextSubmitClick = () => {
    if (textInput.trim().length < 20) {
      setError('Please enter at least 20 characters.');
      return;
    }
    setError('');
    onTextSubmit(textInput.trim());
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') return <FileText size={24} />;
    if (type?.startsWith('image/')) return <Image size={24} />;
    return <FileText size={24} />;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="file-upload-area" id="file-upload-area">
      {/* Mode Tabs */}
      <div className="upload-mode-tabs">
        <button
          className={`upload-mode-tab ${mode === 'upload' ? 'upload-mode-tab--active' : ''}`}
          onClick={() => setMode('upload')}
        >
          <Upload size={16} />
          <span>Upload File</span>
        </button>
        <button
          className={`upload-mode-tab ${mode === 'text' ? 'upload-mode-tab--active' : ''}`}
          onClick={() => setMode('text')}
        >
          <Type size={16} />
          <span>Paste Text</span>
        </button>
      </div>

      {mode === 'upload' && (
        <>
          {!selectedFile ? (
            <div
              className={`upload-dropzone ${isDragging ? 'upload-dropzone--dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-dropzone-icon">
                <Upload size={32} />
              </div>
              <p className="upload-dropzone-title">Drag & drop your file here</p>
              <p className="upload-dropzone-subtitle">or click to browse</p>
              <div className="upload-dropzone-types">
                <span className="upload-type-badge">PDF</span>
                <span className="upload-type-badge">JPG</span>
                <span className="upload-type-badge">PNG</span>
                <span className="upload-type-badge">HEIC</span>
              </div>
              <p className="upload-dropzone-limit">Maximum file size: 50MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.heic"
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="upload-selected-file">
              <div className="upload-file-icon">{getFileIcon(selectedFile.type)}</div>
              <div className="upload-file-info">
                <span className="upload-file-name">{selectedFile.name}</span>
                <span className="upload-file-meta">
                  {ACCEPTED_TYPES[selectedFile.type] || 'File'} · {formatSize(selectedFile.size)}
                </span>
              </div>
              <div className="upload-file-status">
                <CheckCircle size={18} />
              </div>
              <button className="upload-file-remove" onClick={handleRemoveFile}>
                <X size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {mode === 'text' && (
        <div className="upload-text-mode">
          <textarea
            className="upload-text-input"
            placeholder="Paste your lecture notes, textbook content, or any study material here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={8}
          />
          <div className="upload-text-footer">
            <span className="upload-text-count">{textInput.length} characters</span>
            <button
              className="upload-text-submit"
              onClick={handleTextSubmitClick}
              disabled={textInput.trim().length < 20}
            >
              Summarize with AI ✨
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="upload-error">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
}
