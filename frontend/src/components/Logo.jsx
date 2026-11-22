import { useId } from 'react';

// Логотип магазина: знак (молния в «чипе») и надпись. Один компонент для шапки и подвала.
export function LogoMark({ size = 36 }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="logo__mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill={`url(#lg-${id})`} />
      <path d="M7 14h3M7 20h3M7 26h3M30 14h3M30 20h3M30 26h3" stroke="#c7d2fe" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      <path d="M22.6 7.5 13 21.6h6.1L17.4 32.5 27 18.4h-6.1l1.7-10.9Z" fill="#fff" />
      <circle cx="30.5" cy="9.5" r="3" fill="#fbbf24" />
    </svg>
  );
}

export default function Logo({ size = 36, light = false, className = '' }) {
  return (
    <span className={`logo ${light ? 'logo--light' : ''} ${className}`}>
      <LogoMark size={size} />
      <span className="logo__text">
        <span className="logo__name">Техно<span>Маркет</span></span>
        <span className="logo__tagline">магазин гаджетов</span>
      </span>
    </span>
  );
}
