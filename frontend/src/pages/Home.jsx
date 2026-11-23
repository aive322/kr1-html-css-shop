import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductImage from '../components/ProductImage.jsx';
import LoadState from '../components/LoadState.jsx';
import Reveal from '../components/Reveal.jsx';
import CountUp from '../components/CountUp.jsx';
import { pluralize } from '../utils/price.js';

const advantages = [
  { icon: 'bi-truck', title: 'Быстрая доставка', text: 'По городу за 1–2 дня, в другие регионы — до 7 дней.' },
  { icon: 'bi-shield-check', title: 'Гарантия', text: 'На все товары действует гарантия от 12 месяцев.' },
  { icon: 'bi-arrow-repeat', title: 'Возврат 14 дней', text: 'Вернём деньги, если товар не подошёл и не был в использовании.' },
  { icon: 'bi-chat-dots', title: 'Поддержка', text: 'Поможем выбрать гаджет и ответим на вопросы по заказу.' }
];

export default function Home() {
  usePageMeta('', 'ТехноМаркет — интернет-магазин гаджетов: беспроводные мыши и наушники, клавиатуры, power bank, веб-камеры, умные часы и SSD. Цены, скидки и отзывы покупателей.');
  const { products, status } = useProducts();

  const ready = status === 'ready' && products.length > 0;
  const popular = products.filter((p) => p.badgeType === 'featured' || p.badgeType === 'new').slice(0, 4);
  const deals = products.filter((p) => p.badgeType === 'discount');
  const heroProducts = ['click-mini', 'sound-plus', 'fit-band'].map((name) => products.find((p) => p.image === name)).filter(Boolean);
  // По одному отзыву с оценкой 5 от трёх разных товаров.
  const reviews = products
    .map((p) => ({ product: p, review: p.reviews.find((r) => r.rating === 5) }))
    .filter((item) => item.review)
    .slice(0, 3)
    .map(({ product, review }) => ({ ...review, product }));
  const reviewsTotal = products.reduce((sum, p) => sum + p.reviewsCount, 0);
  const avgRating = ready ? products.reduce((sum, p) => sum + p.rating * p.reviewsCount, 0) / reviewsTotal : 0;
  const inStock = products.filter((p) => p.isAvailable).length;

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6">
              <p className="hero__eyebrow">Интернет-магазин гаджетов</p>
              <h1 className="hero__title">Техника, которая <span>работает на вас</span></h1>
              <p className="hero__lead">Беспроводные мыши и наушники, клавиатуры, внешние аккумуляторы и умные часы. Честные цены, скидки и отзывы реальных покупателей.</p>
              <div className="hero__actions d-flex">
                <Link className="btn btn-accent btn-lg" to="/catalog">Перейти в каталог <i className="bi bi-arrow-right ms-1" aria-hidden="true"></i></Link>
                <Link className="btn btn-outline-light btn-lg" to="/about">О магазине</Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero__showcase">
                {heroProducts.map((product, index) => (
                  <Link key={product.id} to={`/product/${product.id}`} className={`hero__tile hero__tile--${index + 1}`}>
                    <ProductImage product={product} sizes="(min-width: 992px) 240px, 40vw" eager={index === 0} alt="" />
                    <span className="hero__tile-label">{product.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <dl className="stats">
          <div className="stats__item"><dt>Товаров в каталоге</dt><dd>{ready ? <CountUp value={products.length} /> : '—'}</dd></div>
          <div className="stats__item"><dt>В наличии</dt><dd>{ready ? <CountUp value={inStock} format={(n) => `${n} из ${products.length}`} /> : '—'}</dd></div>
          <div className="stats__item"><dt>Отзывов покупателей</dt><dd>{ready ? <CountUp value={reviewsTotal} /> : '—'}</dd></div>
          <div className="stats__item"><dt>Средняя оценка</dt><dd>{ready ? <CountUp value={avgRating} decimals={1} /> : '—'}</dd></div>
        </dl>
      </div>

      <section className="section" aria-labelledby="popular-title">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <h2 id="popular-title" className="section-title">Популярные товары</h2>
              <p className="section-subtitle">Хиты продаж и новинки этого сезона</p>
            </div>
            <Link className="btn btn-outline-primary" to="/catalog">Весь каталог <i className="bi bi-arrow-right ms-1" aria-hidden="true"></i></Link>
          </Reveal>
          <LoadState />
          {ready && (
            <div className="row g-4 mobile-card-grid">
              {popular.map((product, index) => (
                <Reveal className="col-12 col-sm-6 col-lg-3" key={product.id} delay={index * 80}><ProductCard product={product} /></Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {ready && deals.length > 0 && (
        <section className="section section--tint" aria-labelledby="deals-title">
          <div className="container">
            <Reveal className="section-head">
              <div>
                <h2 id="deals-title" className="section-title">Скидки недели</h2>
                <p className="section-subtitle">{deals.length} {pluralize(deals.length, 'товар', 'товара', 'товаров')} со сниженной ценой</p>
              </div>
            </Reveal>
            <div className="row g-4 mobile-card-grid">
              {deals.map((product, index) => (
                <Reveal className="col-12 col-sm-6 col-lg-4" key={product.id} delay={(index % 3) * 80}><ProductCard product={product} /></Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="advantages-title">
        <div className="container">
          <Reveal>
            <h2 id="advantages-title" className="section-title text-center">Почему выбирают нас</h2>
            <p className="section-subtitle text-center mb-4">Покупать технику должно быть просто</p>
          </Reveal>
          <div className="row g-4 mobile-card-grid">
            {advantages.map((item, index) => (
              <Reveal className="col-12 col-sm-6 col-lg-3" key={item.title} delay={index * 80}>
                <div className="feature h-100">
                  <span className="feature__icon" aria-hidden="true"><i className={`bi ${item.icon}`}></i></span>
                  <h3 className="feature__title">{item.title}</h3>
                  <p className="feature__text">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {ready && reviews.length > 0 && (
        <section className="section section--tint" aria-labelledby="reviews-title">
          <div className="container">
            <Reveal>
              <h2 id="reviews-title" className="section-title">Отзывы покупателей</h2>
              <p className="section-subtitle mb-4">Что говорят о товарах те, кто уже купил</p>
            </Reveal>
            <div className="row g-4">
              {reviews.map((review, index) => (
                <Reveal className="col-12 col-md-4" key={`${review.product.id}-${review.author}`} delay={index * 100}>
                  <figure className="quote h-100">
                    <div className="quote__stars" role="img" aria-label="Оценка 5 из 5">
                      {[1, 2, 3, 4, 5].map((n) => <i key={n} className="bi bi-star-fill" aria-hidden="true"></i>)}
                    </div>
                    <blockquote className="quote__text">«{review.text}»</blockquote>
                    <figcaption className="quote__author">
                      {review.author} · <Link to={`/product/${review.product.id}`}>{review.product.title}</Link>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <Reveal className="cta" variant="zoom">
            <div>
              <h2 className="cta__title">Не знаете, что выбрать?</h2>
              <p className="cta__text">Позвоните или напишите нам — поможем подобрать гаджет под ваши задачи и бюджет.</p>
            </div>
            <Link className="btn btn-accent btn-lg" to="/contacts#feedback">Получить консультацию</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
