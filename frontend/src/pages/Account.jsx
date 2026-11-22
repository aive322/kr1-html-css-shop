import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, initials } from '../context/AccountContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader from '../components/PageHeader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { formatPrice, pluralize } from '../utils/price.js';

const PHONE_RE = /^\+?[78][\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Небольшой помощник для полей с ошибками.
function Field({ id, label, error, required, hint, children }) {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}{required && <span className="text-danger" aria-hidden="true"> *</span>}</label>
      {children}
      {hint && !error && <div className="form-text" id={`${id}-hint`}>{hint}</div>}
      {error && <div className="invalid-feedback d-block" id={`${id}-error`}>{error}</div>}
    </div>
  );
}

const aria = (id, error, hint) => ({
  id,
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined
});

function AuthCard() {
  const { login, register } = useAccount();
  const toast = useToast();
  const [mode, setMode] = useState('login');
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', agree: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const formRef = useRef(null);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    setFormError('');
  };

  const check = () => {
    const er = {};
    if (mode === 'register' && values.name.trim().length < 2) er.name = 'Введите имя (не менее 2 символов).';
    if (!EMAIL_RE.test(values.email.trim())) er.email = 'Введите корректный адрес почты.';
    if (mode === 'register' && values.phone.trim() && !PHONE_RE.test(values.phone.trim())) er.phone = 'Введите телефон полностью или оставьте поле пустым.';
    if (mode === 'login' && !values.password) er.password = 'Введите пароль.';
    if (mode === 'register' && values.password.length < 6) er.password = 'Пароль должен быть не короче 6 символов.';
    if (mode === 'register' && !values.agree) er.agree = 'Нужно ваше согласие.';
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = check();
    setErrors(er);
    const first = Object.keys(er)[0];
    if (first) {
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    setBusy(true);
    const result = mode === 'login' ? await login(values) : await register(values);
    setBusy(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    toast(mode === 'login' ? 'Вы вошли в личный кабинет' : 'Кабинет создан — добро пожаловать!', 'bi-person-check-fill');
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setFormError('');
  };

  return (
    <div className="auth-card pop-in">
      <div className="auth-card__intro">
        <span className="auth-card__icon" aria-hidden="true"><i className="bi bi-person-circle"></i></span>
        <h2 className="h4">Войдите в кабинет</h2>
        <p className="mb-0">Так вы сможете следить за заказами, хранить избранные товары и оставлять отзывы.</p>
        <ul className="auth-card__perks">
          <li><i className="bi bi-box-seam" aria-hidden="true"></i>История и статусы заказов</li>
          <li><i className="bi bi-lightning" aria-hidden="true"></i>Оформление в один клик — данные подставятся сами</li>
          <li><i className="bi bi-chat-square-text" aria-hidden="true"></i>Отзывы о купленных товарах</li>
        </ul>
      </div>
      <div className="auth-card__form">
        <div className="auth-tabs" role="tablist" aria-label="Вход или регистрация">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'is-active' : ''} onClick={() => switchMode('login')}>Вход</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'is-active' : ''} onClick={() => switchMode('register')}>Регистрация</button>
        </div>
        <form ref={formRef} onSubmit={submit} noValidate key={mode} className="anim-fade-up">
          {formError && <div className="alert alert-danger py-2" role="alert">{formError}</div>}
          {mode === 'register' && (
            <Field id="reg-name" label="Ваше имя" error={errors.name} required>
              <input {...aria('reg-name', errors.name)} name="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} autoComplete="name" value={values.name} onChange={change} />
            </Field>
          )}
          <Field id="auth-email" label="Электронная почта" error={errors.email} required>
            <input {...aria('auth-email', errors.email)} name="email" type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} autoComplete="email" placeholder="name@mail.ru" value={values.email} onChange={change} />
          </Field>
          {mode === 'register' && (
            <Field id="reg-phone" label="Телефон (необязательно)" error={errors.phone}>
              <input {...aria('reg-phone', errors.phone)} name="phone" type="tel" inputMode="tel" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} autoComplete="tel" placeholder="+7 (900) 000-00-00" value={values.phone} onChange={change} />
            </Field>
          )}
          <Field id="auth-password" label="Пароль" error={errors.password} required hint={mode === 'register' ? 'Не менее 6 символов.' : undefined}>
            <input {...aria('auth-password', errors.password, mode === 'register')} name="password" type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={values.password} onChange={change} />
          </Field>
          {mode === 'register' && (
            <div className="form-check mb-3">
              <input id="reg-agree" name="agree" type="checkbox" className={`form-check-input ${errors.agree ? 'is-invalid' : ''}`} checked={values.agree} onChange={change} aria-invalid={errors.agree ? true : undefined} aria-describedby={errors.agree ? 'reg-agree-error' : undefined} />
              <label className="form-check-label" htmlFor="reg-agree">Согласен на обработку персональных данных и с <Link to="/contacts#privacy">политикой конфиденциальности</Link></label>
              {errors.agree && <div className="invalid-feedback d-block" id="reg-agree-error">{errors.agree}</div>}
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-lg w-100" disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
            {mode === 'login' ? 'Войти' : 'Создать кабинет'}
          </button>
          <p className="auth-card__switch">
            {mode === 'login'
              ? <>Нет кабинета? <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => switchMode('register')}>Зарегистрируйтесь</button></>
              : <>Уже есть кабинет? <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => switchMode('login')}>Войдите</button></>}
          </p>
        </form>
      </div>
    </div>
  );
}

function Orders({ orders }) {
  if (!orders.length) {
    return (
      <div className="empty-state">
        <i className="bi bi-box-seam" aria-hidden="true"></i>
        <p>Заказов пока нет. Выберите товар в каталоге — заказ появится здесь.</p>
        <Link className="btn btn-primary" to="/catalog">Перейти в каталог</Link>
      </div>
    );
  }
  return (
    <ul className="list-unstyled order-list">
      {orders.map((o) => (
        <li className="order-row" key={o.id}>
          <div className="order-row__head">
            <p className="order-row__number">Заказ № {o.id}</p>
            <span className="status-pill">{o.status}</span>
          </div>
          <p className="order-row__meta">
            {new Date(o.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}{o.deliveryType === 'courier' ? 'Курьер' : 'Самовывоз'}{' · '}{o.payment}
          </p>
          <ul className="order-row__items">
            {o.items.map((i) => <li key={i.id}><Link to={`/product/${i.id}`}>{i.title}</Link> × {i.qty}</li>)}
          </ul>
          <p className="order-row__total">{formatPrice(o.total)}</p>
        </li>
      ))}
    </ul>
  );
}

function MyReviews() {
  const { myReviews, deleteReview } = useAccount();
  const { products } = useProducts();
  const toast = useToast();
  if (!myReviews.length) {
    return (
      <div className="empty-state">
        <i className="bi bi-chat-square-text" aria-hidden="true"></i>
        <p>Вы ещё не оставляли отзывов. Откройте страницу купленного товара и расскажите о нём другим покупателям.</p>
        <Link className="btn btn-primary" to="/catalog">Выбрать товар</Link>
      </div>
    );
  }
  return (
    <div className="row g-3">
      {myReviews.map((r) => {
        const product = products.find((p) => p.id === r.productId);
        return (
          <div className="col-md-6" key={r.id}>
            <article className="review h-100">
              <header className="d-flex justify-content-between align-items-start gap-2">
                <h3 className="review__author">{product ? <Link to={`/product/${product.id}`}>{product.title}</Link> : 'Товар'}</h3>
                <span className="review__stars" role="img" aria-label={`Оценка ${r.rating} из 5`}>
                  {[1, 2, 3, 4, 5].map((n) => <i key={n} className={`bi ${n <= r.rating ? 'bi-star-fill' : 'bi-star'}`} aria-hidden="true"></i>)}
                </span>
              </header>
              <p className="review__text">{r.text}</p>
              <div className="d-flex justify-content-between align-items-center">
                <p className="review__date mb-0">{r.date}</p>
                <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => { deleteReview(r.id); toast('Отзыв удалён', 'bi-trash3'); }}>Удалить</button>
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}

function Profile() {
  const { user, updateProfile, deleteAccount } = useAccount();
  const toast = useToast();
  const [values, setValues] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(false);

  const change = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (values.name.trim().length < 2) er.name = 'Введите имя (не менее 2 символов).';
    if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) er.phone = 'Введите телефон полностью.';
    setErrors(er);
    if (Object.keys(er).length) return;
    updateProfile({ name: values.name.trim(), phone: values.phone.trim(), address: values.address.trim() });
    toast('Изменения сохранены');
  };

  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <form className="form-card" onSubmit={submit} noValidate>
          <h2 className="h5 mb-3">Личные данные</h2>
          <Field id="p-name" label="Имя" error={errors.name} required>
            <input {...aria('p-name', errors.name)} name="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} autoComplete="name" value={values.name} onChange={change} />
          </Field>
          <Field id="p-email" label="Электронная почта" hint="Почта — это ваш логин, изменить её нельзя.">
            <input {...aria('p-email', null, true)} className="form-control" value={user.email} readOnly />
          </Field>
          <Field id="p-phone" label="Телефон" error={errors.phone}>
            <input {...aria('p-phone', errors.phone)} name="phone" type="tel" inputMode="tel" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} autoComplete="tel" placeholder="+7 (900) 000-00-00" value={values.phone} onChange={change} />
          </Field>
          <Field id="p-address" label="Адрес доставки" hint="Подставится при оформлении заказа.">
            <input {...aria('p-address', null, true)} name="address" className="form-control" autoComplete="street-address" placeholder="Город, улица, дом, квартира" value={values.address} onChange={change} />
          </Field>
          <button type="submit" className="btn btn-primary">Сохранить</button>
        </form>
      </div>
      <div className="col-lg-5">
        <div className="data-card">
          <h2 className="h5"><i className="bi bi-shield-lock me-2" aria-hidden="true"></i>Ваши данные</h2>
          <p>Заказы, избранное и отзывы хранятся в этом браузере на вашем устройстве. На другом устройстве или в другом браузере их не будет видно.</p>
          {!confirm ? (
            <button type="button" className="btn btn-outline-danger" onClick={() => setConfirm(true)}>Удалить аккаунт и данные</button>
          ) : (
            <div className="confirm-box pop-in" role="alert">
              <p className="mb-2"><strong>Удалить аккаунт?</strong> Заказы и отзывы пропадут, восстановить их будет нельзя.</p>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-danger btn-sm" onClick={() => { deleteAccount(); toast('Аккаунт удалён', 'bi-trash3'); }}>Да, удалить</button>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setConfirm(false)}>Отмена</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: 'orders', label: 'Мои заказы', icon: 'bi-box-seam' },
  { id: 'favorites', label: 'Избранное', icon: 'bi-heart' },
  { id: 'reviews', label: 'Мои отзывы', icon: 'bi-chat-square-text' },
  { id: 'profile', label: 'Профиль', icon: 'bi-person-gear' }
];

export default function Account() {
  usePageMeta('Личный кабинет', 'Личный кабинет покупателя ТехноМаркет: заказы, избранные товары, отзывы и личные данные.');
  const { user, logout, myOrders, myReviews } = useAccount();
  const { ids } = useFavorites();
  const { products } = useProducts();
  const toast = useToast();
  const [tab, setTab] = useState('orders');
  const favorites = products.filter((p) => ids.includes(p.id));

  useEffect(() => { if (!user) setTab('orders'); }, [user]);

  return (
    <>
      <PageHeader title="Личный кабинет" subtitle="Заказы, избранные товары и отзывы — всё в одном месте" />
      <section className="section pt-4">
        <div className="container">
          {!user ? (
            <>
              <AuthCard />
              {favorites.length > 0 && (
                <div className="mt-5">
                  <h2 className="section-title h3">Избранные товары</h2>
                  <div className="row g-4">
                    {favorites.map((p, i) => <Reveal className="col-12 col-sm-6 col-lg-3" key={p.id} delay={(i % 4) * 70}><ProductCard product={p} /></Reveal>)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="account-head pop-in">
                <span className="account-head__avatar" aria-hidden="true">{initials(user.name)}</span>
                <div className="account-head__info">
                  <h2 className="account-head__name">{user.name}</h2>
                  <p className="account-head__email">{user.email}</p>
                  <p className="account-head__stats">
                    <span>{myOrders.length} {pluralize(myOrders.length, 'заказ', 'заказа', 'заказов')}</span>
                    <span>{ids.length} в избранном</span>
                    <span>{myReviews.length} {pluralize(myReviews.length, 'отзыв', 'отзыва', 'отзывов')}</span>
                  </p>
                </div>
                <button type="button" className="btn btn-outline-secondary" onClick={() => { logout(); toast('Вы вышли из кабинета', 'bi-box-arrow-right'); }}>
                  <i className="bi bi-box-arrow-right me-2" aria-hidden="true"></i>Выйти
                </button>
              </div>

              <div className="account-tabs" role="tablist" aria-label="Разделы кабинета">
                {tabs.map((t) => (
                  <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-controls={`panel-${t.id}`} aria-selected={tab === t.id} className={tab === t.id ? 'is-active' : ''} onClick={() => setTab(t.id)}>
                    <i className={`bi ${t.icon}`} aria-hidden="true"></i>{t.label}
                  </button>
                ))}
              </div>

              <div className="account-panel anim-fade-up" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} key={tab}>
                {tab === 'orders' && <Orders orders={myOrders} />}
                {tab === 'favorites' && (favorites.length ? (
                  <div className="row g-4">
                    {favorites.map((p) => <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={p.id}><ProductCard product={p} /></div>)}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-heart" aria-hidden="true"></i>
                    <p>Вы пока ничего не добавили. Нажмите на сердечко в карточке товара — он сохранится здесь.</p>
                    <Link className="btn btn-primary" to="/catalog">Перейти в каталог</Link>
                  </div>
                ))}
                {tab === 'reviews' && <MyReviews />}
                {tab === 'profile' && <Profile />}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
