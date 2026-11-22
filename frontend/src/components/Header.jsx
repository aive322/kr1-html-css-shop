import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAccount } from '../context/AccountContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { company } from '../data/company.js';
import Logo from './Logo.jsx';
import SearchModal from './SearchModal.jsx';

const links = [
  { to: '/', label: 'Главная', end: true },
  { to: '/catalog', label: 'Каталог' },
  { to: '/about', label: 'О нас' },
  { to: '/contacts', label: 'Контакты' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const { ids } = useFavorites();
  const { totals } = useCart();
  const { user } = useAccount();
  const { theme, toggleTheme } = useTheme();
  const themeBtn = useRef(null);

  // Меню на телефоне закрывается после перехода по ссылке.
  useEffect(() => setOpen(false), [pathname]);

  // Тень у шапки появляется, когда страница прокручена.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ctrl+K (или ⌘K) открывает поиск.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const dark = theme === 'dark';

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="topbar d-none d-md-block">
        <div className="container d-flex justify-content-between gap-3">
          <span><i className="bi bi-truck me-2" aria-hidden="true"></i>Бесплатная доставка от 5 000 ₽</span>
          <span className="d-none d-lg-inline"><i className="bi bi-shield-check me-2" aria-hidden="true"></i>Гарантия на все товары от 12 месяцев</span>
          <a href={company.phone.href}><i className="bi bi-telephone me-2" aria-hidden="true"></i>{company.phone.text}</a>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg main-nav" aria-label="Основная навигация">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <Logo />
          </Link>

          <div className="header-actions order-lg-last">
            <button type="button" className="icon-link-btn d-none d-sm-inline-flex" onClick={() => setSearchOpen(true)} aria-label="Поиск по каталогу (Ctrl+K)">
              <i className="bi bi-search" aria-hidden="true"></i>
            </button>
            <button type="button" ref={themeBtn} className="icon-link-btn theme-toggle" onClick={() => toggleTheme(themeBtn.current)} aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'} title={dark ? 'Светлая тема' : 'Тёмная тема'}>
              <i key={theme} className={`bi ${dark ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true"></i>
            </button>
            <NavLink className="icon-link-btn d-none d-sm-inline-flex" to="/favorites" aria-label={`Избранное: ${ids.length}`}>
              <i className="bi bi-heart" aria-hidden="true"></i>
              {ids.length > 0 && <span key={ids.length} className="icon-link-btn__count" aria-hidden="true">{ids.length}</span>}
            </NavLink>
            <NavLink className="icon-link-btn d-none d-sm-inline-flex" to="/account" aria-label={user ? `Личный кабинет: ${user.name}` : 'Войти в личный кабинет'}>
              <i className={`bi ${user ? 'bi-person-check-fill' : 'bi-person'}`} aria-hidden="true"></i>
            </NavLink>
            <NavLink className="icon-link-btn" to="/cart" aria-label={`Корзина: ${totals.count} шт.`}>
              <i className="bi bi-bag" aria-hidden="true"></i>
              {totals.count > 0 && <span key={totals.count} className="icon-link-btn__count" aria-hidden="true">{totals.count}</span>}
            </NavLink>
            <button
              className="navbar-toggler"
              type="button"
              aria-controls="main-menu"
              aria-expanded={open}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              onClick={() => setOpen((value) => !value)}
            >
              <i className={`bi ${open ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true"></i>
            </button>
          </div>

          <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="main-menu">
            <ul className="navbar-nav mx-lg-auto">
              {links.map((link) => (
                <li className="nav-item" key={link.to}>
                  <NavLink className="nav-link" to={link.to} end={link.end}>{link.label}</NavLink>
                </li>
              ))}
              <li className="nav-item d-sm-none">
                <button type="button" className="nav-link" onClick={() => { setOpen(false); setSearchOpen(true); }}>
                  <i className="bi bi-search me-2" aria-hidden="true"></i>Поиск
                </button>
              </li>
              <li className="nav-item d-sm-none">
                <NavLink className="nav-link" to="/favorites"><i className="bi bi-heart me-2" aria-hidden="true"></i>Избранное{ids.length > 0 && ` (${ids.length})`}</NavLink>
              </li>
              <li className="nav-item d-sm-none">
                <NavLink className="nav-link" to="/account"><i className={`bi ${user ? 'bi-person-check-fill' : 'bi-person'} me-2`} aria-hidden="true"></i>{user ? 'Личный кабинет' : 'Войти'}</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <SearchModal open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
