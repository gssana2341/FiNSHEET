import { useRef, useEffect } from 'react';
import './DraggableFAB.css';

export default function DraggableFAB({ icon: Icon, badgeCount, onClick }) {
  const fabRef = useRef(null);

  useEffect(() => {
    const fab = fabRef.current;
    if (!fab) return;

    let isDragging = false;
    let startX, startY;
    let initialLeft, initialTop;
    let hasMoved = false;

    // Use touch events for better mobile support
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      
      const rect = fab.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      isDragging = true;
      hasMoved = false;
      
      // Override fixed positioning constraints to allow free movement
      fab.style.bottom = 'auto';
      fab.style.right = 'auto';
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault(); // prevent scrolling while dragging button
      
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        hasMoved = true;
      }
      
      // Calculate boundaries
      const newLeft = initialLeft + dx;
      const newTop = initialTop + dy;
      
      // Keep within screen
      const maxLeft = window.innerWidth - fab.offsetWidth;
      const maxTop = window.innerHeight - fab.offsetHeight - 80; // 80px buffer for bottom nav
      
      fab.style.left = `${Math.min(Math.max(0, newLeft), maxLeft)}px`;
      fab.style.top = `${Math.min(Math.max(0, newTop), maxTop)}px`;
    };

    const handleTouchEnd = (e) => {
      isDragging = false;
      if (hasMoved) {
        const currentLeft = parseFloat(fab.style.left);
        if (isNaN(currentLeft)) return;
        
        const screenWidth = window.innerWidth;
        const fabWidth = fab.offsetWidth;
        
        fab.style.transition = 'left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
        
        if (currentLeft + (fabWidth / 2) < screenWidth / 2) {
          fab.style.left = '16px';
        } else {
          fab.style.left = `${screenWidth - fabWidth - 16}px`;
        }
        
        setTimeout(() => {
          if (fab) fab.style.transition = 'none';
        }, 300);
      }
    };

    fab.addEventListener('touchstart', handleTouchStart, { passive: false });
    fab.addEventListener('touchmove', handleTouchMove, { passive: false });
    fab.addEventListener('touchend', handleTouchEnd);

    // Click handler override to prevent firing if dragged
    const handleClick = (e) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (onClick) onClick(e);
    };

    fab.addEventListener('click', handleClick);

    return () => {
      fab.removeEventListener('touchstart', handleTouchStart);
      fab.removeEventListener('touchmove', handleTouchMove);
      fab.removeEventListener('touchend', handleTouchEnd);
      fab.removeEventListener('click', handleClick);
    };
  }, [onClick]);

  return (
    <button ref={fabRef} className="draggable-fab">
      <Icon size={24} />
      {badgeCount > 0 && <span className="fab-badge">{badgeCount}</span>}
    </button>
  );
}
