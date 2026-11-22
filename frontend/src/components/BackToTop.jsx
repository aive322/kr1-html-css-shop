import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../hooks/useInView.js';

// Кнопка «Наверх» появляется, когда страница прокручена вниз.
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`to-top ${visible ? 'is-visible' : ''}`}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
    >
      Наверх
    </button>
  );
}
