import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '../hooks/useInView.js';

const ThemeContext = createContext(null);
const KEY = 'tm-theme';

function initialTheme() {
  const fromHtml = document.documentElement.getAttribute('data-bs-theme');
  if (fromHtml === 'dark' || fromHtml === 'light') return fromHtml;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Светлая и тёмная тема. Переключение — с анимацией «круга» от кнопки (View Transitions API).
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1120' : '#0f172a');
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* без сохранения */
    }
  }, [theme]);

  const toggleTheme = useCallback((originElement) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;

    if (prefersReducedMotion()) {
      setTheme(next);
      return;
    }

    if (document.startViewTransition && originElement) {
      const rect = originElement.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = document.startViewTransition(() => {
        flushSync(() => setTheme(next));
        root.setAttribute('data-bs-theme', next);
      });
      transition.ready
        .then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
          );
        })
        .catch(() => {});
      return;
    }

    // Запасной вариант для браузеров без View Transitions: плавная смена цветов.
    root.classList.add('theme-fade');
    setTheme(next);
    setTimeout(() => root.classList.remove('theme-fade'), 600);
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
