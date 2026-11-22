import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import ProductImage from './ProductImage.jsx';
import { formatPrice } from '../utils/price.js';

const suggestions = ['наушники', 'мышь', 'power bank', 'клавиатура', 'часы', 'SSD'];

// Поиск по каталогу: результаты появляются сразу при вводе. Открывается кнопкой или Ctrl+K.
export default function SearchModal({ open, onClose }) {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    document.body.classList.add('modal-open-lock');
    setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll('input, button, a[href]');
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open-lock');
      previous?.focus?.();
    };
  }, [open, onClose]);

  useEffect(() => { if (!open) setQuery(''); }, [open]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const results = q.length > 0
    ? products.filter((p) => `${p.title} ${p.shortDescription}`.toLowerCase().includes(q)).slice(0, 6)
    : [];

  const submit = (event) => {
    event.preventDefault();
    if (!q) return;
    onClose();
    navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="search-modal" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="search-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="search-title" ref={dialogRef}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 id="search-title" className="h5 mb-0">Поиск по каталогу</h2>
          <button type="button" className="icon-link-btn" onClick={onClose} aria-label="Закрыть поиск"><i className="bi bi-x-lg" aria-hidden="true"></i></button>
        </div>
        <form onSubmit={submit} role="search" className="search-modal__form">
          <i className="bi bi-search" aria-hidden="true"></i>
          <label htmlFor="site-search" className="visually-hidden">Что ищете?</label>
          <input id="site-search" ref={inputRef} type="search" className="form-control form-control-lg" placeholder="Например, наушники" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
          <button type="submit" className="btn btn-primary">Найти</button>
        </form>

        {!q && (
          <div className="search-modal__hints">
            <p className="search-modal__label">Часто ищут</p>
            <div className="d-flex flex-wrap gap-2">
              {suggestions.map((s) => <button type="button" key={s} className="chip" onClick={() => setQuery(s)}>{s}</button>)}
            </div>
          </div>
        )}

        {q && (
          <div aria-live="polite">
            {results.length > 0 ? (
              <ul className="search-results list-unstyled mb-0">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link to={`/product/${p.id}`} className="search-result" onClick={onClose}>
                      <ProductImage product={p} sizes="56px" className="search-result__image" alt="" />
                      <span className="search-result__title">{p.title}</span>
                      <span className="search-result__price">{formatPrice(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="search-modal__empty">По запросу «{query.trim()}» ничего не нашлось. Попробуйте другое слово.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
