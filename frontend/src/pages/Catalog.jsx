import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader from '../components/PageHeader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoadState from '../components/LoadState.jsx';
import Reveal from '../components/Reveal.jsx';
import { formatPrice, pluralize } from '../utils/price.js';

const labels = [
  { value: 'all', label: 'Все' },
  { value: 'featured', label: 'Хиты' },
  { value: 'new', label: 'Новинки' },
  { value: 'discount', label: 'Скидки' }
];

const sorts = {
  popular: { label: 'По популярности', fn: (a, b) => b.reviewsCount - a.reviewsCount || b.rating - a.rating },
  cheap: { label: 'Сначала дешевле', fn: (a, b) => a.price - b.price },
  expensive: { label: 'Сначала дороже', fn: (a, b) => b.price - a.price },
  rating: { label: 'По рейтингу', fn: (a, b) => b.rating - a.rating }
};

export default function Catalog() {
  usePageMeta('Каталог товаров', 'Каталог гаджетов ТехноМаркет: поиск по названию, фильтры по цене и наличию, хиты, новинки и скидки.');
  const { products, status } = useProducts();
  const maxAvailablePrice = useMemo(() => Math.max(0, ...products.map((p) => p.price)), [products]);

  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');

  // Запрос из окна поиска в шапке: /catalog?q=наушники
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setQuery(q);
  }, [searchParams]);
  const [label, setLabel] = useState('all');
  const [maxPrice, setMaxPrice] = useState(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState('popular');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const priceLimit = maxPrice ?? maxAvailablePrice;

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return products
      .filter((p) => !text || p.title.toLowerCase().includes(text) || p.shortDescription.toLowerCase().includes(text))
      .filter((p) => label === 'all' || p.badgeType === label)
      .filter((p) => p.price <= priceLimit)
      .filter((p) => !onlyAvailable || p.isAvailable)
      .sort(sorts[sort].fn);
  }, [products, query, label, priceLimit, onlyAvailable, sort]);

  const reset = () => {
    setQuery('');
    setLabel('all');
    setMaxPrice(null);
    setOnlyAvailable(false);
  };

  return (
    <>
      <PageHeader title="Каталог товаров" subtitle="Найдите гаджет по названию, цене и наличию" />
      <section className="section pt-4">
        <div className="container">
          <LoadState />
          {status === 'ready' && (
            <div className="row g-4">
              <aside className="col-lg-3" aria-label="Фильтры каталога">
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 d-lg-none mb-3"
                  aria-expanded={filtersOpen}
                  aria-controls="catalog-filters"
                  onClick={() => setFiltersOpen((v) => !v)}
                >
                  <i className="bi bi-sliders me-2" aria-hidden="true"></i>{filtersOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
                <form
                  id="catalog-filters"
                  className={`filters ${filtersOpen ? '' : 'd-none'} d-lg-block`}
                  onSubmit={(e) => e.preventDefault()}
                  role="search"
                >
                  <div className="mb-4">
                    <label className="form-label filters__label" htmlFor="search">Поиск</label>
                    <div className="input-group">
                      <span className="input-group-text" aria-hidden="true"><i className="bi bi-search"></i></span>
                      <input id="search" type="search" className="form-control" placeholder="Например, наушники" value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                  </div>

                  <fieldset className="mb-4">
                    <legend className="filters__label">Подборка</legend>
                    <div className="chips">
                      {labels.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={`chip ${label === item.value ? 'is-active' : ''}`}
                          aria-pressed={label === item.value}
                          onClick={() => setLabel(item.value)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between">
                      <label className="form-label filters__label" htmlFor="max-price">Цена до</label>
                      <output htmlFor="max-price" className="fw-semibold">{formatPrice(priceLimit)}</output>
                    </div>
                    <input id="max-price" type="range" className="form-range" min="500" max={maxAvailablePrice} step="500" value={priceLimit} onChange={(e) => setMaxPrice(Number(e.target.value))} />
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input className="form-check-input" type="checkbox" role="switch" id="only-available" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
                    <label className="form-check-label" htmlFor="only-available">Только в наличии</label>
                  </div>

                  <button type="button" className="btn btn-outline-secondary w-100" onClick={reset}>Сбросить фильтры</button>
                </form>
              </aside>

              <div className="col-lg-9">
                <div className="toolbar">
                  <p className="mb-0" role="status">Найдено: <strong>{visible.length}</strong> {pluralize(visible.length, 'товар', 'товара', 'товаров')}</p>
                  <div className="d-flex align-items-center gap-2">
                    <label htmlFor="sort" className="text-nowrap toolbar__label">Сортировка</label>
                    <select id="sort" className="form-select form-select-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
                      {Object.entries(sorts).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
                    </select>
                  </div>
                </div>

                {visible.length > 0 ? (
                  <div className="row g-4 mobile-card-grid">
                    {visible.map((product, index) => (
                      <Reveal className="col-12 col-sm-6 col-xl-4" key={product.id} delay={(index % 3) * 70}>
                        <ProductCard product={product} headingLevel={2} eager={index < 3} />
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state pop-in">
                    <i className="bi bi-search" aria-hidden="true"></i>
                    <h2 className="h5">Ничего не нашлось</h2>
                    <p>Попробуйте изменить запрос или сбросить фильтры.</p>
                    <button type="button" className="btn btn-primary" onClick={reset}>Сбросить фильтры</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
