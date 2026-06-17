import React, { useState, useEffect, useRef } from 'react';
import ProfileCard from './ProfileCard';

export default function CardStack({ profiles, onSwipeLeft, onSwipeRight }) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (profiles.length === 0 || transitioning) return;
      if (e.key === 'ArrowLeft') {
        triggerSwipe('left');
      } else if (e.key === 'ArrowRight') {
        triggerSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profiles, transitioning]);

  const triggerSwipe = (direction) => {
    if (transitioning) return;
    setTransitioning(true);

    const swipeOutX = direction === 'left' ? -600 : 600;
    setDragOffset({ x: swipeOutX, y: 0 });

    setTimeout(() => {
      if (direction === 'left') {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
      setDragOffset({ x: 0, y: 0 });
      setTransitioning(false);
    }, 300);
  };

  const handlePointerDown = (e) => {
    if (profiles.length === 0 || transitioning) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    if (cardRef.current) {
      cardRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (cardRef.current) {
      cardRef.current.releasePointerCapture(e.pointerId);
    }

    const threshold = 120;
    if (dragOffset.x > threshold) {
      triggerSwipe('right');
    } else if (dragOffset.x < -threshold) {
      triggerSwipe('left');
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  if (profiles.length === 0) return null;

  // Render top card + up to 2 background cards
  const visibleProfiles = profiles.slice(0, 3);

  return (
    <div className="relative w-full max-w-[400px] h-[530px] md:h-[590px] mx-auto flex items-center justify-center">
      {visibleProfiles.map((profile, index) => {
        const isTop = index === 0;
        const isSecond = index === 1;
        const isThird = index === 2;

        let style = {};
        let cardDragX = 0;

        if (isTop) {
          cardDragX = dragOffset.x;
          const rotate = dragOffset.x * 0.05; // tilt slightly based on drag direction
          style = {
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotate}deg)`,
            zIndex: 30,
            cursor: isDragging ? 'grabbing' : 'grab',
          };
        } else if (isSecond) {
          style = {
            transform: 'scale(0.95) translateY(16px)',
            zIndex: 20,
            opacity: 0.85,
          };
        } else if (isThird) {
          style = {
            transform: 'scale(0.90) translateY(32px)',
            zIndex: 10,
            opacity: 0.6,
          };
        }

        return (
          <div
            key={profile.id}
            ref={isTop ? cardRef : null}
            className={`absolute w-full select-none ${
              isTop && !isDragging && !transitioning ? 'swipe-card-transition' : ''
            }`}
            style={style}
            onPointerDown={isTop ? handlePointerDown : null}
            onPointerMove={isTop ? handlePointerMove : null}
            onPointerUp={isTop ? handlePointerUp : null}
            onPointerCancel={isTop ? handlePointerUp : null}
          >
            <ProfileCard
              profile={profile}
              dragX={cardDragX}
              isTop={isTop}
            />
          </div>
        );
      })}
    </div>
  );
}
export { CardStack };
