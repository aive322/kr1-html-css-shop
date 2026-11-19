import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';

export default function NotFound() {
  usePageMeta('Страница не найдена', 'Такой страницы нет в интернет-магазине ТехноМаркет.');
  return (
    <section className="section">
      <div className="container text-center not-found">
        <p className="not-found__code" aria-hidden="true">404</p>
        <h1 className="h2">Страница не найдена</h1>
        <p className="text-secondary-emphasis">Возможно, ссылка устарела или в адресе есть опечатка.</p>
        <Link className="btn btn-primary" to="/catalog">Перейти в каталог</Link>
      </div>
    </section>
  );
}
