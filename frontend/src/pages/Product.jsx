import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAccount } from '../context/AccountContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
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
import Reveal from '../components/Reveal.jsx';
import { calculateDiscountPercent, formatPrice, getProductStatus, pluralize } from '../utils/price.js';

const specValue = (product, name) => product.specs.find(([key]) => key === name)?.[1] ?? '—';

// Блок покупки: количество и кнопка «В корзину».
function BuyBox({ product }) {
  const { add, has, MAX_QTY } = useCart();
  const [qty, setQty] = useState(1);
  if (!product.isAvailable) {
    return <Link className="btn btn-outline-primary btn-lg" to="/catalog">Выбрать другой товар</Link>;
  }
  return (
    <>
      <QtyStepper value={qty} max={MAX_QTY} onChange={setQty} />
      <button type="button" className="btn btn-primary btn-lg" onClick={() => add(product, qty)}>
        <i className="bi bi-bag-plus me-2" aria-hidden="true"></i>В корзину
      </button>
      {has(product.id) && <Link className="btn btn-outline-primary btn-lg pop-in" to="/cart">Перейти в корзину</Link>}
    </>
  );
}

// Форма отзыва. Оставить отзыв может только вошедший покупатель.
function ReviewForm({ product }) {
  const { user, addReview } = useAccount();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState({});

  if (!user) {
    return (
      <div className="review-form review-form--guest">
        <i className="bi bi-chat-square-text" aria-hidden="true"></i>
        <p className="mb-0">Купили этот товар? <Link to="/account">Войдите в кабинет</Link>, чтобы оставить отзыв.</p>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!rating) er.rating = 'Поставьте оценку от 1 до 5.';
    if (text.trim().length < 10) er.text = 'Напишите хотя бы пару предложений (от 10 символов).';
    setErrors(er);
    if (Object.keys(er).length) return;
    addReview({ productId: product.id, author: user.name, rating, text: text.trim() });
    setRating(0);
    setText('');
    toast('Спасибо! Отзыв опубликован', 'bi-chat-square-heart-fill');
  };

  return (
    <form className="review-form" onSubmit={submit} noValidate>
      <h3 className="h5">Оставить отзыв</h3>
      <fieldset className="mb-3">
        <legend className="form-label fs-6">Ваша оценка</legend>
        <div className="star-input">
          {[5, 4, 3, 2, 1].map((n) => (
            <span key={n}>
              <input type="radio" id={`star-${n}`} name="rating" value={n} checked={rating === n} onChange={() => { setRating(n); setErrors((er) => ({ ...er, rating: undefined })); }} />
              <label htmlFor={`star-${n}`} title={`${n} из 5`}><i className="bi bi-star-fill" aria-hidden="true"></i><span className="visually-hidden">{n} из 5</span></label>
            </span>
          ))}
        </div>
        {errors.rating && <div className="invalid-feedback d-block">{errors.rating}</div>}
      </fieldset>
      <label className="form-label" htmlFor="review-text">Отзыв</label>
      <textarea id="review-text" className={`form-control ${errors.text ? 'is-invalid' : ''}`} rows="3" placeholder="Что понравилось, что нет, как пользуетесь" value={text} onChange={(e) => { setText(e.target.value); setErrors((er) => ({ ...er, text: undefined })); }} aria-invalid={errors.text ? true : undefined} aria-describedby={errors.text ? 'review-text-error' : undefined}></textarea>
      {errors.text && <div className="invalid-feedback d-block" id="review-text-error">{errors.text}</div>}
      <button type="submit" className="btn btn-primary mt-3">Опубликовать</button>
    </form>
  );
}

export default function Product() {
  const { id } = useParams();
  const { products, status } = useProducts();
  const { reviews: userReviews } = useAccount();
  const product = products.find((p) => String(p.id) === id);

  usePageMeta(product?.title ?? 'Товар', product ? `${product.title} — ${product.description} Цена ${formatPrice(product.price)}.` : undefined);

  if (status !== 'ready') {
    return <div className="container section"><LoadState /></div>;
  }
  if (!product) {
    return <NotFound />;
  }

  const discount = calculateDiscountPercent(product.oldPrice, product.price);
  // Похожие товары — ближайшие по цене.
  const byPrice = products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price));
  const compared = [product, ...byPrice.filter((p) => p.isAvailable).slice(0, 2)];
  const similar = byPrice.slice(0, 3);
  // Отзывы покупателей с сайта показываем первыми.
  const ownReviews = userReviews.filter((r) => r.productId === product.id);
  const allReviews = [...ownReviews, ...product.reviews];
  const reviewsTotal = product.reviewsCount + ownReviews.length;
  const stars = [5, 4, 3, 2, 1].map((n) => ({ n, count: allReviews.filter((r) => r.rating === n).length }));

  return (
    <>
      <PageHeader title={product.title} crumbs={[{ to: '/catalog', label: 'Каталог' }]} />

      <section className="section pt-4">
        <div className="container">
          <div className="row g-4 g-lg-5 align-items-start">
            <div className="col-lg-6">
              <div className="product-gallery anim-zoom-in">
                <ProductImage product={product} sizes="(min-width: 1200px) 540px, (min-width: 992px) 45vw, 92vw" className="product-gallery__image" eager />
                <ProductBadge product={product} className="product-gallery__badge" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="product-info anim-fade-up">
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
                <div className="buy-box">
                  <BuyBox product={product} key={product.id} />
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
            <Reveal className="col-lg-6">
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
            </Reveal>
            <Reveal className="col-lg-6" delay={100}>
              <h2 className="section-title h3">Сравнение</h2>
              <div className="table-responsive card-table" tabIndex={0} role="region" aria-label="Таблица сравнения, прокручивается по горизонтали">
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
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="reviews-title">
        <div className="container">
          <h2 id="reviews-title" className="section-title">Отзывы покупателей</h2>
          <div className="row g-4">
            <Reveal className="col-lg-4">
              <div className="rating-summary">
                <p className="rating-summary__value">{String(product.rating).replace('.', ',')}<span> из 5</span></p>
                <p className="rating-summary__count">{reviewsTotal} {pluralize(reviewsTotal, 'отзыв', 'отзыва', 'отзывов')}</p>
                <ul className="list-unstyled mb-0">
                  {stars.map(({ n, count }) => (
                    <li className="rating-bar" key={n}>
                      <span className="rating-bar__label">{n} <i className="bi bi-star-fill" aria-hidden="true"></i><span className="visually-hidden"> звёзд:</span></span>
                      <span className="rating-bar__track" aria-hidden="true"><span style={{ width: `${(count / allReviews.length) * 100}%` }}></span></span>
                      <span className="rating-bar__count">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <div className="col-lg-8">
              <div className="row g-3">
                {allReviews.map((review, index) => (
                  <Reveal className="col-md-6" key={review.id ?? review.author} delay={Math.min(index, 3) * 80}>
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
                  </Reveal>
                ))}
              </div>
              <div className="mt-4">
                <ReviewForm product={product} key={product.id} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="similar-title">
        <div className="container">
          <h2 id="similar-title" className="section-title">Похожие товары</h2>
          <div className="row g-4 mt-1">
            {similar.map((p, index) => (
              <Reveal className="col-12 col-sm-6 col-lg-4" key={p.id} delay={index * 80}><ProductCard product={p} /></Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
