import { useState } from 'react';
import { Upload, FileText, X, CheckSquare } from 'lucide-react';
import Button from '../ui/Button';
import { t } from '../../i18n';
import './UploadForm.css';

const SUGGESTED_PRICES = [29, 49, 79];

export default function UploadForm({ onSubmit = () => {}, onCancel = () => {} }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [university, setUniversity] = useState('');
  const [price, setPrice] = useState(49);
  const [previewPages, setPreviewPages] = useState(2);
  const [tags, setTags] = useState('');
  const [agreedToS, setAgreedToS] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === 'application/pdf') setFile(f);
  };

  const handleSubmit = () => {
    if (!file || !title || !subject || !agreedToS) return;
    setIsSubmitting(true);
    // Simulate AI moderation scan
    setTimeout(() => {
      onSubmit({
        file,
        title,
        subject,
        university,
        priceSatang: price * 100,
        previewPages,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const isValid = file && title.trim() && subject.trim() && agreedToS;

  return (
    <div className="upload-form" id="upload-form">
      <h2 className="upload-form-title">Upload New Summary</h2>

      {/* File */}
      <div className="upload-form-field">
        <label className="upload-form-label">PDF File *</label>
        {!file ? (
          <label className="upload-form-file-picker">
            <Upload size={20} />
            <span>Choose PDF file</span>
            <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        ) : (
          <div className="upload-form-file-selected">
            <FileText size={18} />
            <span>{file.name}</span>
            <button onClick={() => setFile(null)}><X size={14} /></button>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="upload-form-field">
        <label className="upload-form-label">Title *</label>
        <input className="upload-form-input" placeholder="e.g. Calculus II Complete Summary" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {/* Subject + University */}
      <div className="upload-form-row">
        <div className="upload-form-field">
          <label className="upload-form-label">Subject *</label>
          <input className="upload-form-input" placeholder="e.g. Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="upload-form-field">
          <label className="upload-form-label">University</label>
          <input className="upload-form-input" placeholder="e.g. Chulalongkorn" value={university} onChange={(e) => setUniversity(e.target.value)} />
        </div>
      </div>

      {/* Price */}
      <div className="upload-form-field">
        <label className="upload-form-label">Price (THB)</label>
        <div className="upload-form-price-row">
          {SUGGESTED_PRICES.map((p) => (
            <button key={p} className={`upload-form-price-chip ${price === p ? 'upload-form-price-chip--active' : ''}`} onClick={() => setPrice(p)}>
              ฿{p}
            </button>
          ))}
          <input className="upload-form-input upload-form-price-input" type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
      </div>

      {/* Preview Pages */}
      <div className="upload-form-field">
        <label className="upload-form-label">Free Preview Pages</label>
        <select className="upload-form-input" value={previewPages} onChange={(e) => setPreviewPages(Number(e.target.value))}>
          <option value={1}>1 page</option>
          <option value={2}>2 pages (recommended)</option>
          <option value={3}>3 pages</option>
        </select>
      </div>

      {/* Tags */}
      <div className="upload-form-field">
        <label className="upload-form-label">Tags (comma-separated)</label>
        <input className="upload-form-input" placeholder="e.g. calculus, integrals, series" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>

      {/* ToS */}
      <label className="upload-form-tos">
        <input type="checkbox" checked={agreedToS} onChange={(e) => setAgreedToS(e.target.checked)} />
        <CheckSquare size={18} className={`upload-form-check ${agreedToS ? 'upload-form-check--checked' : ''}`} />
        <span>I confirm this content is my original work and does not infringe any copyright.</span>
      </label>

      {/* Actions */}
      <div className="upload-form-actions">
        <Button variant="ghost" onClick={onCancel}>{t('modal.cancel')}</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Scanning content...' : 'Publish Summary'}
        </Button>
      </div>
    </div>
  );
}
