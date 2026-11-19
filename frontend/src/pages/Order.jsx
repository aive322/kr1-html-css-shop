import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader from '../components/PageHeader.jsx';
import ProductImage from '../components/ProductImage.jsx';
import LoadState from '../components/LoadState.jsx';
import { formatPrice } from '../utils/price.js';

const empty = { name: '', phone: '', email: '', product: '', quantity: 1, delivery: 'courier', comment: '', agreement: false };
const DELIVERY_PRICE = 300;

// Проверка полей формы. Возвращает объект { поле: текст ошибки }.
function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Введите имя — не короче 2 символов.';
  if (!/^\+?[78][\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}$/.test(values.phone.trim())) errors.phone = 'Введите телефон в формате +7 (900) 000-00-00.';
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Проверьте адрес e-mail, например name@example.com.';
  if (!values.product) errors.product = 'Выберите товар.';
  if (!(values.quantity >= 1 && values.quantity <= 10)) errors.quantity = 'Количество — от 1 до 10.';
  if (!values.agreement) errors.agreement = 'Нужно согласие на обработку данных.';
  return errors;
}

export default function Order() {
  usePageMeta('Оформить заявку', 'Оформление заявки на покупку гаджета в интернет-магазине ТехноМаркет: выберите товар, количество и способ доставки.');
  const { products, status } = useProducts();
  const [searchParams] = useSearchParams();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);
  const formRef = useRef(null);
  const successRef = useRef(null);

  const available = products.filter((p) => p.isAvailable);

  // Товар можно передать в адресе: /order?product=3
  useEffect(() => {
    const id = searchParams.get('product');
    if (id && available.some((p) => String(p.id) === id)) {
      setValues((v) => ({ ...v, product: id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, status]);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  const selected = available.find((p) => String(p.id) === values.product);
  const subtotal = selected ? selected.price * values.quantity : 0;
  const delivery = values.delivery === 'courier' && selected ? DELIVERY_PRICE : 0;
  const total = subtotal + delivery;

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    const next = { ...values, [name]: type === 'checkbox' ? checked : name === 'quantity' ? Number(value) : value };
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
    setSent({ name: values.name.trim(), product: selected.title, total });
    setValues(empty);
  };

  const field = (name) => ({
    id: `order-${name}`,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `order-${name}-error` : undefined
  });
  const error = (name) => errors[name] && <div className="invalid-feedback d-block" id={`order-${name}-error`}>{errors[name]}</div>;
  const invalid = (name) => (errors[name] ? ' is-invalid' : '');

  const summaryText = useMemo(() => (selected ? `${selected.title} × ${values.quantity}` : 'Товар не выбран'), [selected, values.quantity]);

  return (
    <>
      <PageHeader title="Оформить заявку" subtitle="Заполните форму — менеджер свяжется с вами для подтверждения заказа" />
      <section className="section pt-4">
        <div className="container">
          <LoadState />
          {sent && (
            <div className="alert alert-success order-success" role="status" tabIndex={-1} ref={successRef}>
              <h2 className="h5"><i className="bi bi-check-circle-fill me-2" aria-hidden="true"></i>Заявка принята</h2>
              <p className="mb-2">{sent.name}, спасибо! Заявка на «{sent.product}» на сумму {formatPrice(sent.total)} сформирована. В учебной версии сайта данные никуда не отправляются.</p>
              <Link to="/catalog" className="alert-link">Вернуться в каталог</Link>
            </div>
          )}

          {status === 'ready' && (
            <div className="row g-4">
              <div className="col-lg-8">
                <form ref={formRef} className="form-card" noValidate onSubmit={submit} aria-labelledby="form-title">
                  <h2 id="form-title" className="h4 mb-4">Контактные данные</h2>
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
                      <label className="form-label" htmlFor="order-email">E-mail</label>
                      <input {...field('email')} type="email" className={`form-control${invalid('email')}`} autoComplete="email" placeholder="name@example.com" value={values.email} onChange={change} />
                      {error('email')}
                    </div>
                  </div>

                  <h2 className="h4 mt-5 mb-4">Заказ</h2>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label" htmlFor="order-product">Товар <span className="text-danger" aria-hidden="true">*</span></label>
                      <select {...field('product')} className={`form-select${invalid('product')}`} value={values.product} onChange={change} required>
                        <option value="">Выберите товар</option>
                        {available.map((p) => <option key={p.id} value={String(p.id)}>{p.title} — {formatPrice(p.price)}</option>)}
                      </select>
                      {error('product')}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" htmlFor="order-quantity">Количество</label>
                      <input {...field('quantity')} type="number" min="1" max="10" className={`form-control${invalid('quantity')}`} value={values.quantity} onChange={change} />
                      {error('quantity')}
                    </div>
                    <fieldset className="col-12">
                      <legend className="form-label fs-6">Способ получения</legend>
                      <div className="delivery-options">
                        <label className={`delivery-option ${values.delivery === 'courier' ? 'is-active' : ''}`}>
                          <input type="radio" name="delivery" value="courier" className="form-check-input" checked={values.delivery === 'courier'} onChange={change} />
                          <span><strong>Курьер</strong><small>1–2 дня, {formatPrice(DELIVERY_PRICE)}</small></span>
                        </label>
                        <label className={`delivery-option ${values.delivery === 'pickup' ? 'is-active' : ''}`}>
                          <input type="radio" name="delivery" value="pickup" className="form-check-input" checked={values.delivery === 'pickup'} onChange={change} />
                          <span><strong>Самовывоз</strong><small>Бесплатно, завтра</small></span>
                        </label>
                      </div>
                    </fieldset>
                    <div className="col-12">
                      <label className="form-label" htmlFor="order-comment">Комментарий</label>
                      <textarea {...field('comment')} className="form-control" rows="3" placeholder="Удобное время звонка, адрес доставки" value={values.comment} onChange={change}></textarea>
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input {...field('agreement')} type="checkbox" className={`form-check-input${invalid('agreement')}`} checked={values.agreement} onChange={change} required />
                        <label className="form-check-label" htmlFor="order-agreement">Я согласен на обработку персональных данных <span className="text-danger" aria-hidden="true">*</span></label>
                        {error('agreement')}
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg mt-4 w-100 w-md-auto">Отправить заявку</button>
                </form>
              </div>

              <div className="col-lg-4">
                <aside className="summary" aria-labelledby="summary-title">
                  <h2 id="summary-title" className="h5">Ваш заказ</h2>
                  {selected && (
                    <div className="summary__product">
                      <ProductImage product={selected} sizes="80px" className="summary__image" />
                      <div>
                        <p className="summary__name">{selected.title}</p>
                        <p className="summary__price">{formatPrice(selected.price)}</p>
                      </div>
                    </div>
                  )}
                  <dl className="summary__rows">
                    <div><dt>{summaryText}</dt><dd>{formatPrice(subtotal)}</dd></div>
                    <div><dt>Доставка</dt><dd>{delivery ? formatPrice(delivery) : 'Бесплатно'}</dd></div>
                    <div className="summary__total"><dt>Итого</dt><dd>{formatPrice(total)}</dd></div>
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
