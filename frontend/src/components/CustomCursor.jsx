import { useState, useEffect } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    // Listen for hover on interactive elements to change cursor size/color
    const addHover = () => setHovered(true);
    const removeHover = () => setHovered(false);

    window.addEventListener('mousemove', moveCursor);

    // Apply interactive hover state to all buttons and links dynamically
    document.querySelectorAll('a, button, input').forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.querySelectorAll('a, button, input').forEach(el => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
      });
    };
  }, []);

  return (
    <>
      {/* Outer subtle glow trailing slightly behind */}
      <div 
        className={`custom-cursor-glow ${hovered ? 'hover' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      />
      {/* Inner sharp red/blue dot */}
      <div 
        className={`custom-cursor-dot ${hovered ? 'hover' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      />
    </>
  );
}
