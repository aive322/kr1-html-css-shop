import { Link, useParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader from '../components/PageHeader.jsx';
import ProductImage from '../components/ProductImage.jsx';
import ProductBadge from '../components/ProductBadge.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Rating from '../components/Rating.jsx';
import LoadState from '../components/LoadState.jsx';
import NotFound from './NotFound.jsx';
import { calculateDiscountPercent, formatPrice, getProductStatus, pluralize } from '../utils/price.js';

const specValue = (product, name) => product.specs.find(([key]) => key === name)?.[1] ?? '—';

export default function Product() {
  const { id } = useParams();
  const { products, status } = useProducts();
  const product = products.find((p) => String(p.id) === id);

  usePageMeta(product?.title ?? 'Товар', product ? `${product.title} — ${product.description} Цена ${formatPrice(product.price)}.` : undefined);

  if (status !== 'ready') {
    return <div className="container section"><LoadState /></div>;
  }
  if (!product) {
    return <NotFound />;
  }

  const discount = calculateDiscountPercent(product.oldPrice, product.price);
  const compared = [product, ...products.filter((p) => p.id !== product.id && p.isAvailable).slice(0, 2)];
  const similar = products.filter((p) => p.id !== product.id).slice(0, 3);
  const stars = [5, 4, 3, 2, 1].map((n) => ({ n, count: product.reviews.filter((r) => r.rating === n).length }));

  return (
    <>
      <PageHeader title={product.title} crumbs={[{ to: '/catalog', label: 'Каталог' }]} />

      <section className="section pt-4">
        <div className="container">
          <div className="row g-4 g-lg-5 align-items-start">
            <div className="col-lg-6">
              <div className="product-gallery">
                <ProductImage product={product} sizes="(min-width: 1200px) 540px, (min-width: 992px) 45vw, 92vw" className="product-gallery__image" eager />
                <ProductBadge product={product} className="product-gallery__badge" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="product-info">
                <Rating value={product.rating} count={product.reviewsCount} />
                <p className="product-info__lead">{product.description}</p>
                <div className="product-info__price">
                  <span className={discount ? 'text-sale' : ''}>{formatPrice(product.price)}</span>
                  {discount > 0 && (
                    <>
                      <s className="product-info__old"><span className="visually-hidden">Старая цена: </span>{formatPrice(product.oldPrice)}</s>
                      <span className="product-badge badge-discount">−{discount}%</span>
                    </>
                  )}
                </div>
                <p className={`stock ${product.isAvailable ? 'stock--yes' : 'stock--no'}`}>
                  <i className={`bi ${product.isAvailable ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`} aria-hidden="true"></i>
                  {getProductStatus(product)}
                </p>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {product.isAvailable ? (
                    <Link className="btn btn-primary btn-lg" to={`/order?product=${product.id}`}>
                      <i className="bi bi-bag-plus me-2" aria-hidden="true"></i>Оформить заявку
                    </Link>
                  ) : (
                    <Link className="btn btn-outline-primary btn-lg" to="/catalog">Выбрать другой товар</Link>
                  )}
                  <FavoriteButton product={product} className="favorite-btn--lg" />
                </div>
                <ul className="perks">
                  <li><i className="bi bi-truck" aria-hidden="true"></i>Доставка по городу за 1–2 дня</li>
                  <li><i className="bi bi-shield-check" aria-hidden="true"></i>Гарантия: {specValue(product, 'Гарантия')}</li>
                  <li><i className="bi bi-arrow-repeat" aria-hidden="true"></i>Возврат в течение 14 дней</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row g-4 mt-2">
            <div className="col-lg-6">
              <h2 className="section-title h3">Характеристики</h2>
              <div className="table-responsive card-table">
                <table className="table mb-0">
                  <caption className="visually-hidden">Характеристики: {product.title}</caption>
                  <tbody>
                    {product.specs.map(([key, value]) => (
                      <tr key={key}><th scope="row">{key}</th><td>{value}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-lg-6">
              <h2 className="section-title h3">Сравнение</h2>
              <div className="table-responsive card-table">
                <table className="table compare mb-0">
                  <caption className="visually-hidden">Сравнение товара {product.title} с похожими товарами</caption>
                  <thead>
                    <tr>
                      <th scope="col">Параметр</th>
                      {compared.map((p) => <th scope="col" key={p.id} className={p.id === product.id ? 'is-current' : ''}>{p.title}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr><th scope="row">Цена</th>{compared.map((p) => <td key={p.id} className={p.id === product.id ? 'is-current' : ''}>{formatPrice(p.price)}</td>)}</tr>
                    <tr><th scope="row">Гарантия</th>{compared.map((p) => <td key={p.id} className={p.id === product.id ? 'is-current' : ''}>{specValue(p, 'Гарантия')}</td>)}</tr>
                    <tr><th scope="row">Рейтинг</th>{compared.map((p) => <td key={p.id} className={p.id === product.id ? 'is-current' : ''}>{String(p.rating).replace('.', ',')}</td>)}</tr>
                    <tr><th scope="row">Наличие</th>{compared.map((p) => <td key={p.id} className={p.id === product.id ? 'is-current' : ''}>{getProductStatus(p)}</td>)}</tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="reviews-title">
        <div className="container">
          <h2 id="reviews-title" className="section-title">Отзывы покупателей</h2>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="rating-summary">
                <p className="rating-summary__value">{String(product.rating).replace('.', ',')}<span> из 5</span></p>
                <p className="rating-summary__count">{product.reviewsCount} {pluralize(product.reviewsCount, 'отзыв', 'отзыва', 'отзывов')}</p>
                <ul className="list-unstyled mb-0">
                  {stars.map(({ n, count }) => (
                    <li className="rating-bar" key={n}>
                      <span className="rating-bar__label">{n} <i className="bi bi-star-fill" aria-hidden="true"></i><span className="visually-hidden"> звёзд:</span></span>
                      <span className="rating-bar__track" aria-hidden="true"><span style={{ width: `${(count / product.reviewsCount) * 100}%` }}></span></span>
                      <span className="rating-bar__count">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="row g-3">
                {product.reviews.map((review) => (
                  <div className="col-md-6" key={review.author}>
                    <article className="review h-100">
                      <header className="d-flex justify-content-between align-items-start gap-2">
                        <h3 className="review__author">{review.author}</h3>
                        <span className="review__stars" role="img" aria-label={`Оценка ${review.rating} из 5`}>
                          {[1, 2, 3, 4, 5].map((n) => <i key={n} className={`bi ${n <= review.rating ? 'bi-star-fill' : 'bi-star'}`} aria-hidden="true"></i>)}
                        </span>
                      </header>
                      <p className="review__text">{review.text}</p>
                      <p className="review__date">{review.date}</p>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="similar-title">
        <div className="container">
          <h2 id="similar-title" className="section-title">Похожие товары</h2>
          <div className="row g-4 mt-1">
            {similar.map((p) => (
              <div className="col-12 col-sm-6 col-lg-4" key={p.id}><ProductCard product={p} /></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
