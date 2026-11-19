import { Link } from 'react-router-dom';

// Шапка внутренней страницы: хлебные крошки, заголовок h1 и подзаголовок.
export default function PageHeader({ title, subtitle, crumbs = [] }) {
  return (
    <section className="page-header">
      <div className="container">
        <nav aria-label="Хлебные крошки">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Главная</Link></li>
            {crumbs.map((crumb) => (
              <li className="breadcrumb-item" key={crumb.label}>
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
              </li>
            ))}
            <li className="breadcrumb-item active" aria-current="page">{title}</li>
          </ol>
        </nav>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
    </section>
  );
}
