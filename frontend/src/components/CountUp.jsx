import { useEffect, useState } from 'react';
import useInView, { prefersReducedMotion } from '../hooks/useInView.js';

// Число «набегает» от 0 до value, когда блок появляется на экране.
export default function CountUp({ value, decimals = 0, duration = 1200, format }) {
  const [ref, inView] = useInView();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReducedMotion()) {
      setCurrent(value);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // плавное замедление в конце
      setCurrent(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  const text = current.toFixed(decimals).replace('.', ',');
  return (
    <span ref={ref}>
      <span aria-hidden="true">{format ? format(text) : text}</span>
      <span className="visually-hidden">{format ? format(String(value.toFixed(decimals)).replace('.', ',')) : String(value.toFixed(decimals)).replace('.', ',')}</span>
    </span>
  );
}
