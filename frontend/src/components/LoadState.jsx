import { useProducts } from '../context/ProductsContext.jsx';

// Скелетоны во время загрузки товаров или сообщение об ошибке.
export default function LoadState() {
  const { status, reload } = useProducts();
  if (status === 'loading') {
    // Пока товары грузятся, показываем «скелетоны» карточек с мерцанием.
    return (
      <div className="load-state" role="status">
        <span className="visually-hidden">Загружаем товары…</span>
        <div className="row g-4" aria-hidden="true">
          {[0, 1, 2, 3].map((n) => (
            <div className="col-12 col-sm-6 col-lg-3" key={n}>
              <div className="skeleton-card">
                <div className="skeleton skeleton--image"></div>
                <div className="skeleton skeleton--line"></div>
                <div className="skeleton skeleton--line skeleton--short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="alert alert-warning load-state-error" role="alert">
        <h2 className="h5">Не удалось загрузить товары</h2>
        <p className="mb-2">Проверьте подключение к интернету и попробуйте ещё раз. Если ошибка повторяется, позвоните нам — оформим заказ по телефону.</p>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={reload}>Повторить</button>
      </div>
    );
  }
  return null;
}
