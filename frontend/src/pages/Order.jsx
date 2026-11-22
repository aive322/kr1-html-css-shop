import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAccount } from '../context/AccountContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader from '../components/PageHeader.jsx';
import ProductImage from '../components/ProductImage.jsx';
import LoadState from '../components/LoadState.jsx';
import { formatPrice, pluralize } from '../utils/price.js';
import { company, DELIVERY_PRICE, FREE_DELIVERY_FROM } from '../data/company.js';

const PHONE_RE = /^\+?[78][\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const payments = [
  { value: 'card', icon: 'bi-credit-card', title: 'Картой при получении', text: 'Курьеру или на кассе' },
  { value: 'sbp', icon: 'bi-qr-code', title: 'СБП при получении', text: 'Оплата по QR-коду' },
  { value: 'cash', icon: 'bi-cash-coin', title: 'Наличными', text: 'Курьеру или на кассе' }
];

// Проверка полей формы. Возвращает объект { поле: текст ошибки }.
function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Введите имя — не короче 2 символов.';
  if (!PHONE_RE.test(values.phone.trim())) errors.phone = 'Введите телефон в формате +7 (900) 000-00-00.';
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Введите почту, например name@mail.ru — на неё придёт подтверждение.';
  if (values.delivery === 'courier' && values.address.trim().length < 8) errors.address = 'Укажите адрес: улицу, дом и квартиру.';
  if (!values.agreement) errors.agreement = 'Нужно согласие на обработку данных.';
  return errors;
}

export default function Order() {
  usePageMeta('Оформление заказа', 'Оформление заказа в интернет-магазине ТехноМаркет: контакты, доставка курьером или самовывоз, оплата при получении.');
  const { status } = useProducts();
  const { lines, totals, clear } = useCart();
  const { user, addOrder } = useAccount();
  const [values, setValues] = useState(() => ({
    name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '',
    delivery: 'courier', address: user?.address ?? '', payment: 'card', comment: '', agreement: false
  }));
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);
  const formRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    if (sent) {
      window.scrollTo(0, 0);
      successRef.current?.focus({ preventScroll: true });
    }
  }, [sent]);

  const delivery = values.delivery === 'courier' ? totals.delivery : 0;
  const total = totals.subtotal + delivery;

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    const next = { ...values, [name]: type === 'checkbox' ? checked : value };
    setValues(next);
    if (errors[name]) setErrors(validate(next));
  };

  const submit = (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstError = Object.keys(found)[0];
    if (firstError) {
      formRef.current?.querySelector(`[name="${firstError}"]`)?.focus();
      return;
    }
    const order = addOrder({
      items: lines.map(({ product, qty }) => ({ id: product.id, title: product.title, price: product.price, qty })),
      count: totals.count,
      subtotal: totals.subtotal,
      delivery,
      total,
      deliveryType: values.delivery,
      address: values.delivery === 'courier' ? values.address.trim() : company.address,
      payment: payments.find((p) => p.value === values.payment).title,
      contact: { name: values.name.trim(), phone: values.phone.trim(), email: values.email.trim() },
      comment: values.comment.trim()
    });
    setSent(order);
    clear();
  };

  const field = (name) => ({
    id: `order-${name}`,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `order-${name}-error` : undefined
  });
  const error = (name) => errors[name] && <div className="invalid-feedback d-block" id={`order-${name}-error`}>{errors[name]}</div>;
  const invalid = (name) => (errors[name] ? ' is-invalid' : '');

  if (sent) {
    return (
      <>
        <PageHeader title="Заказ оформлен" crumbs={[{ to: '/cart', label: 'Корзина' }]} />
        <section className="section pt-4">
          <div className="container">
            <div className="order-done pop-in" role="status" tabIndex={-1} ref={successRef}>
              <span className="order-done__icon" aria-hidden="true"><i className="bi bi-check-lg"></i></span>
              <h2 className="h3">Спасибо, {sent.contact.name}!</h2>
              <p className="order-done__number">Заказ № {sent.id}</p>
              <p>
                {sent.count} {pluralize(sent.count, 'товар', 'товара', 'товаров')} на сумму <strong>{formatPrice(sent.total)}</strong>.
                {' '}Менеджер позвонит на номер {sent.contact.phone} в течение 15 минут, чтобы подтвердить заказ.
                {' '}{sent.deliveryType === 'courier' ? `Доставим по адресу: ${sent.address}.` : `Забрать заказ можно по адресу: ${company.address}.`}
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {user
                  ? <Link className="btn btn-primary" to="/account">Мои заказы</Link>
                  : <Link className="btn btn-primary" to="/account">Создать кабинет и следить за заказом</Link>}
                <Link className="btn btn-outline-primary" to="/catalog">Продолжить покупки</Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Оформление заказа" crumbs={[{ to: '/cart', label: 'Корзина' }]} subtitle="Проверьте данные — менеджер позвонит для подтверждения" />
      <section className="section pt-4">
        <div className="container">
          <LoadState />
          {status === 'ready' && lines.length === 0 && (
            <div className="empty-state pop-in">
              <i className="bi bi-bag" aria-hidden="true"></i>
              <h2 className="h5">Корзина пуста</h2>
              <p>Добавьте товары, чтобы оформить заказ.</p>
              <Link className="btn btn-primary" to="/catalog">Перейти в каталог</Link>
            </div>
          )}

          {status === 'ready' && lines.length > 0 && (
            <div className="row g-4">
              <div className="col-lg-8">
                <form ref={formRef} className="form-card anim-fade-up" noValidate onSubmit={submit} aria-labelledby="form-title">
                  {!user && (
                    <p className="login-hint">
                      <i className="bi bi-person-circle" aria-hidden="true"></i>
                      <span>Уже покупали у нас? <Link to="/account">Войдите</Link> — данные подставятся сами, а заказ сохранится в кабинете.</span>
                    </p>
                  )}
                  <h2 id="form-title" className="h4 mb-2">1. Получатель</h2>
                  <p className="form-text mb-4">Поля, отмеченные <span className="text-danger" aria-hidden="true">*</span><span className="visually-hidden">звёздочкой</span>, обязательны.</p>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="order-name">Имя <span className="text-danger" aria-hidden="true">*</span></label>
                      <input {...field('name')} type="text" className={`form-control${invalid('name')}`} autoComplete="name" value={values.name} onChange={change} required />
                      {error('name')}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="order-phone">Телефон <span className="text-danger" aria-hidden="true">*</span></label>
                      <input {...field('phone')} type="tel" inputMode="tel" className={`form-control${invalid('phone')}`} autoComplete="tel" placeholder="+7 (900) 000-00-00" value={values.phone} onChange={change} required />
                      {error('phone')}
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="order-email">Электронная почта <span className="text-danger" aria-hidden="true">*</span></label>
                      <input {...field('email')} type="email" className={`form-control${invalid('email')}`} autoComplete="email" placeholder="name@mail.ru" value={values.email} onChange={change} required />
                      {error('email')}
                    </div>
                  </div>

                  <fieldset className="mt-5">
                    <legend className="h4 mb-3">2. Способ получения</legend>
                    <div className="delivery-options">
                      <label className={`delivery-option ${values.delivery === 'courier' ? 'is-active' : ''}`}>
                        <input type="radio" name="delivery" value="courier" className="form-check-input" checked={values.delivery === 'courier'} onChange={change} />
                        <span><strong>Курьером</strong><small>1–2 дня · {totals.delivery ? formatPrice(DELIVERY_PRICE) : 'бесплатно'}</small></span>
                      </label>
                      <label className={`delivery-option ${values.delivery === 'pickup' ? 'is-active' : ''}`}>
                        <input type="radio" name="delivery" value="pickup" className="form-check-input" checked={values.delivery === 'pickup'} onChange={change} />
                        <span><strong>Самовывоз</strong><small>Завтра · бесплатно</small></span>
                      </label>
                    </div>
                  </fieldset>
                  {values.delivery === 'courier' ? (
                    <div className="mt-3 anim-fade-up" key="courier">
                      <label className="form-label" htmlFor="order-address">Адрес доставки <span className="text-danger" aria-hidden="true">*</span></label>
                      <input {...field('address')} type="text" className={`form-control${invalid('address')}`} autoComplete="street-address" placeholder="Город, улица, дом, квартира" value={values.address} onChange={change} />
                      {error('address')}
                      {totals.delivery > 0 && <p className="form-text">Бесплатная доставка — при заказе от {formatPrice(FREE_DELIVERY_FROM)}.</p>}
                    </div>
                  ) : (
                    <p className="pickup-note mt-3 anim-fade-up" key="pickup">
                      <i className="bi bi-shop" aria-hidden="true"></i>
                      <span><strong>{company.address}</strong><br />{company.hours}. Заказ хранится 7 дней.</span>
                    </p>
                  )}

                  <fieldset className="mt-5">
                    <legend className="h4 mb-3">3. Оплата</legend>
                    <div className="delivery-options delivery-options--3">
                      {payments.map((p) => (
                        <label key={p.value} className={`delivery-option ${values.payment === p.value ? 'is-active' : ''}`}>
                          <input type="radio" name="payment" value={p.value} className="form-check-input" checked={values.payment === p.value} onChange={change} />
                          <span><strong><i className={`bi ${p.icon} me-1`} aria-hidden="true"></i>{p.title}</strong><small>{p.text}</small></span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="mt-4">
                    <label className="form-label" htmlFor="order-comment">Комментарий к заказу</label>
                    <textarea {...field('comment')} className="form-control" rows="3" placeholder="Удобное время доставки, код домофона" value={values.comment} onChange={change}></textarea>
                  </div>
                  <div className="form-check mt-3">
                    <input {...field('agreement')} type="checkbox" className={`form-check-input${invalid('agreement')}`} checked={values.agreement} onChange={change} required />
                    <label className="form-check-label" htmlFor="order-agreement">Согласен на обработку персональных данных и с <Link to="/contacts#privacy">политикой конфиденциальности</Link> <span className="text-danger" aria-hidden="true">*</span></label>
                    {error('agreement')}
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg mt-4 w-100 w-md-auto">Подтвердить заказ на {formatPrice(total)}</button>
                </form>
              </div>

              <div className="col-lg-4">
                <aside className="summary summary--sticky anim-fade-up anim-delay-1" aria-labelledby="summary-title">
                  <div className="d-flex justify-content-between align-items-baseline">
                    <h2 id="summary-title" className="h5">Ваш заказ</h2>
                    <Link to="/cart" className="small">Изменить</Link>
                  </div>
                  <ul className="list-unstyled summary__items">
                    {lines.map(({ product, qty }) => (
                      <li className="summary__product" key={product.id}>
                        <ProductImage product={product} sizes="56px" className="summary__image" alt="" />
                        <div>
                          <p className="summary__name">{product.title}</p>
                          <p className="summary__price">{qty} × {formatPrice(product.price)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <dl className="summary__rows">
                    <div><dt>Товары ({totals.count})</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
                    {totals.savings > 0 && <div className="summary__savings"><dt>Ваша выгода</dt><dd>{formatPrice(totals.savings)}</dd></div>}
                    <div><dt>Доставка</dt><dd>{delivery ? formatPrice(delivery) : 'Бесплатно'}</dd></div>
                    <div className="summary__total"><dt>Итого</dt><dd key={total} className="value-flash">{formatPrice(total)}</dd></div>
                  </dl>
                </aside>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
