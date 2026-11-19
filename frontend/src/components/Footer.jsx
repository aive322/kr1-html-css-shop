import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';

export default function Footer() {
  const { source } = useProducts();
  const sourceText = source === 'api' ? 'сервер на Go (/api/products)' : source === 'file' ? 'запасной файл products.json (сервер Go не запущен)' : 'загружаются…';
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-5">
            <p className="brand brand--light mb-2">
              <span className="brand__logo" aria-hidden="true"><i className="bi bi-lightning-charge-fill"></i></span>
              ТехноМаркет
            </p>
            <p className="site-footer__text">Гаджеты и аксессуары для работы, учёбы и отдыха. Учебный проект по дисциплине «Фронтенд и бэкенд разработка».</p>
          </div>
          <div className="col-6 col-md-3">
            <h2 className="site-footer__title">Разделы</h2>
            <ul className="list-unstyled site-footer__links">
              <li><Link to="/catalog">Каталог</Link></li>
              <li><Link to="/order">Оформить заявку</Link></li>
              <li><Link to="/favorites">Избранное</Link></li>
              <li><Link to="/contacts">Контакты</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-4">
            <h2 className="site-footer__title">Связаться</h2>
            <ul className="list-unstyled site-footer__links">
              <li><a href="tel:+79000000000">+7 (900) 000-00-00</a></li>
              <li><a href="mailto:info@example.com">info@example.com</a></li>
              <li>г. Москва</li>
            </ul>
          </div>
        </div>
        <div className="site-footer__copy">
          <span>© 2026 ТехноМаркет · Учебный проект</span>
          <span className="site-footer__source"><i className="bi bi-hdd-network me-2" aria-hidden="true"></i>Данные о товарах: {sourceText}</span>
        </div>
      </div>
    </footer>
  );
}
