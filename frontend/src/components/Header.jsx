import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';

const links = [
  { to: '/', label: 'Главная', end: true },
  { to: '/catalog', label: 'Каталог' },
  { to: '/contacts', label: 'Контакты' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { ids } = useFavorites();

  // Меню на телефоне закрывается после перехода по ссылке.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="site-header">
      <div className="topbar d-none d-md-block">
        <div className="container d-flex justify-content-between gap-3">
          <span><i className="bi bi-truck me-2" aria-hidden="true"></i>Доставка по городу за 1–2 дня</span>
          <span><i className="bi bi-shield-check me-2" aria-hidden="true"></i>Гарантия на все товары от 12 месяцев</span>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg main-nav" aria-label="Основная навигация">
        <div className="container">
          <Link className="navbar-brand brand" to="/">
            <span className="brand__logo" aria-hidden="true"><i className="bi bi-lightning-charge-fill"></i></span>
            ТехноМаркет
          </Link>

          <div className="d-flex align-items-center gap-2 order-lg-last">
            <NavLink className="icon-link-btn" to="/favorites" aria-label={`Избранное: ${ids.length}`}>
              <i className="bi bi-heart" aria-hidden="true"></i>
              {ids.length > 0 && <span className="icon-link-btn__count" aria-hidden="true">{ids.length}</span>}
            </NavLink>
            <Link className="btn btn-primary d-none d-sm-inline-flex" to="/order">Оформить заявку</Link>
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
                <NavLink className="nav-link" to="/order">Оформить заявку</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
