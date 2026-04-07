import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './BannerCarousel.css';

const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

export default function BannerCarousel({ banners = [], onBannerClick }) {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [progress, setProgress] = useState(0);
  const trackRef = useRef(null);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const progressStartRef = useRef(null);

  const count = banners.length;

  // --- Auto-slide ---
  const startAutoSlide = useCallback(() => {
    if (count <= 1) return;
    stopAutoSlide();
    progressStartRef.current = Date.now();
    setProgress(0);

    // Progress animation
    const tick = () => {
      const elapsed = Date.now() - progressStartRef.current;
      const pct = Math.min((elapsed / AUTO_SLIDE_INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        progressRef.current = requestAnimationFrame(tick);
      }
    };
    progressRef.current = requestAnimationFrame(tick);

    timerRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, AUTO_SLIDE_INTERVAL);
  }, [count]);

  const stopAutoSlide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
    timerRef.current = null;
    progressRef.current = null;
  }, []);

  useEffect(() => {
    startAutoSlide();
    return stopAutoSlide;
  }, [current, startAutoSlide, stopAutoSlide]);

  // --- Navigation ---
  const goTo = (index) => {
    setCurrent(index);
  };

  const goNext = () => {
    setCurrent((prev) => (prev + 1) % count);
  };

  const goPrev = () => {
    setCurrent((prev) => (prev - 1 + count) % count);
  };

  // --- Touch / Mouse Drag ---
  const handleDragStart = (clientX) => {
    stopAutoSlide();
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 60;
    if (translateX < -threshold) {
      goNext();
    } else if (translateX > threshold) {
      goPrev();
    }
    setTranslateX(0);
  };

  // Mouse events
  const onMouseDown = (e) => handleDragStart(e.clientX);
  const onMouseMove = (e) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => { if (isDragging) handleDragEnd(); };

  // Touch events
  const onTouchStart = (e) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  if (count === 0) return null;

  const trackStyle = {
    transform: `translateX(calc(-${current * 100}% + ${isDragging ? translateX : 0}px))`,
  };

  return (
    <div
      className={`banner-carousel ${isDragging ? 'banner-carousel--dragging' : ''}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Track */}
      <div className="banner-track" ref={trackRef} style={trackStyle}>
        {banners.map((banner, i) => (
          <div
            className="banner-slide"
            key={banner.id || i}
            onClick={() => !isDragging && onBannerClick?.(banner)}
          >
            <img src={banner.image} alt={banner.title} draggable={false} />
            <div className="banner-overlay">
              {banner.tag && (
                <span className="banner-overlay-tag">{banner.tag}</span>
              )}
              <h3 className="banner-overlay-title">{banner.title}</h3>
              {banner.description && (
                <p className="banner-overlay-desc">{banner.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            className="banner-arrow banner-arrow--left"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="banner-arrow banner-arrow--right"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="banner-dots">
          {banners.map((_, i) => (
            <button
              key={i}
              className={`banner-dot ${i === current ? 'banner-dot--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {count > 1 && (
        <div
          className="banner-progress"
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}
