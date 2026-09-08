import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [cursorText, setCursorText] = useState('');

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMouseMove = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });
    };

    const handleMouseEnter = (e) => {
      const mode = e.currentTarget.getAttribute('data-cursor');
      const text = e.currentTarget.getAttribute('data-cursor-text') || '';

      cursor.classList.remove('hovering', 'diagram-mode', 'cta-mode');

      if (mode === 'diagram') {
        cursor.classList.add('diagram-mode');
        setCursorText(text || 'TARGET');
      } else if (mode === 'cta') {
        cursor.classList.add('cta-mode');
        setCursorText(text || 'SCAN');
      } else {
        cursor.classList.add('hovering');
        setCursorText(text);
      }
    };

    const handleMouseLeave = () => {
      cursor.classList.remove('hovering', 'diagram-mode', 'cta-mode');
      setCursorText('');
    };

    window.addEventListener('mousemove', handleMouseMove);

    const updateListeners = () => {
      const elements = document.querySelectorAll('a, button, input, .interactive, [data-cursor]');
      elements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    updateListeners();
    const interval = setInterval(updateListeners, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
      const elements = document.querySelectorAll('a, button, input, .interactive, [data-cursor]');
      elements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor">
      {cursorText}
    </div>
  );
}
