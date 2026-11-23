import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader from '../components/PageHeader.jsx';
import ProductImage from '../components/ProductImage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
import LoadState from '../components/LoadState.jsx';
import Reveal from '../components/Reveal.jsx';
import { formatPrice, pluralize } from '../utils/price.js';
import { FREE_DELIVERY_FROM } from '../data/company.js';

export default function Cart() {
  usePageMeta('Корзина', 'Корзина интернет-магазина ТехноМаркет: проверьте товары, количество и стоимость доставки перед оформлением заказа.');
  const { products, status } = useProducts();
  const { lines, totals, setQty, removeItem, clear, MAX_QTY } = useCart();

  const left = Math.max(0, FREE_DELIVERY_FROM - totals.subtotal);
  const progress = Math.min(100, Math.round((totals.subtotal / FREE_DELIVERY_FROM) * 100));
  const inCart = new Set(lines.map((l) => l.id));
  const recommended = products.filter((p) => p.isAvailable && !inCart.has(p.id)).sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <>
      <PageHeader title="Корзина" subtitle={lines.length ? `${totals.count} ${pluralize(totals.count, 'товар', 'товара', 'товаров')} на сумму ${formatPrice(totals.subtotal)}` : 'Добавьте товары из каталога'} />
      <section className="section pt-4">
        <div className="container">
          <LoadState />
          {status === 'ready' && (lines.length === 0 ? (
            <div className="empty-state pop-in">
              <i className="bi bi-bag" aria-hidden="true"></i>
              <h2 className="h5">В корзине пока пусто</h2>
              <p>Загляните в каталог — там скидки до 20% и новинки.</p>
              <Link className="btn btn-primary" to="/catalog">Перейти в каталог</Link>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="cart-list">
                  <div className="cart-list__head">
                    <h2 className="h5 mb-0">Товары</h2>
                    <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={clear}>
                      <i className="bi bi-trash3 me-1" aria-hidden="true"></i>Очистить корзину
                    </button>
                  </div>
                  <ul className="list-unstyled mb-0">
                    {lines.map(({ product, qty }) => (
                      <li className="cart-item anim-fade-up" key={product.id}>
                        <Link to={`/product/${product.id}`} className="cart-item__media" tabIndex={-1} aria-hidden="true">
                          <ProductImage product={product} sizes="96px" className="cart-item__image" alt="" />
                        </Link>
                        <div className="cart-item__info">
                          <h3 className="cart-item__title"><Link to={`/product/${product.id}`}>{product.title}</Link></h3>
                          <p className="cart-item__unit">
                            {formatPrice(product.price)} / шт.
                            {product.oldPrice > 0 && <s className="ms-2"><span className="visually-hidden">Старая цена: </span>{formatPrice(product.oldPrice)}</s>}
                          </p>
                          <button type="button" className="cart-item__remove" onClick={() => removeItem(product.id)} aria-label={`Удалить из корзины: ${product.title}`}>
                            <i className="bi bi-x-lg" aria-hidden="true"></i><span>Удалить</span>
                          </button>
                        </div>
                        <QtyStepper value={qty} max={MAX_QTY} onChange={(v) => setQty(product.id, v)} label={`Количество: ${product.title}`} size="sm" />
                        <p className="cart-item__sum" key={qty}>{formatPrice(product.price * qty)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-lg-4">
                <aside className="summary summary--sticky" aria-labelledby="cart-summary">
                  <h2 id="cart-summary" className="h5">Итого</h2>
                  <div className="free-delivery">
                    <p className="mb-2">
                      {left > 0
                        ? <>До бесплатной доставки осталось <strong>{formatPrice(left)}</strong></>
                        : <><i className="bi bi-check-circle-fill me-1" aria-hidden="true"></i>Доставка бесплатная</>}
                    </p>
                    <div className="free-delivery__track" aria-hidden="true"><span style={{ width: `${progress}%` }}></span></div>
                  </div>
                  <dl className="summary__rows">
                    <div><dt>Товары ({totals.count})</dt><dd>{formatPrice(totals.subtotal + totals.savings)}</dd></div>
                    {totals.savings > 0 && <div className="summary__savings"><dt>Скидка</dt><dd>−{formatPrice(totals.savings)}</dd></div>}
                    <div><dt>Доставка курьером</dt><dd>{totals.delivery ? formatPrice(totals.delivery) : 'Бесплатно'}</dd></div>
                    <div className="summary__total"><dt>К оплате</dt><dd key={totals.total} className="value-flash">{formatPrice(totals.total)}</dd></div>
                  </dl>
                  <Link className="btn btn-primary btn-lg w-100 mt-3" to="/checkout">Перейти к оформлению</Link>
                  <p className="summary__note"><i className="bi bi-shop me-1" aria-hidden="true"></i>Самовывоз из магазина — бесплатно</p>
                </aside>
              </div>
            </div>
          ))}
        </div>
      </section>

      {status === 'ready' && recommended.length > 0 && (
        <section className="section section--tint" aria-labelledby="also-title">
          <div className="container">
            <h2 id="also-title" className="section-title">С этим покупают</h2>
            <div className="row g-4 mt-1 mobile-card-grid">
              {recommended.map((p, index) => (
                <Reveal className="col-12 col-sm-6 col-lg-3" key={p.id} delay={index * 70}><ProductCard product={p} /></Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
