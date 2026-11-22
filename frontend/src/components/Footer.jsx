import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { company } from '../data/company.js';
import Logo from './Logo.jsx';

const buyers = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/cart', label: 'Корзина' },
  { to: '/contacts#delivery', label: 'Доставка и оплата' },
  { to: '/contacts#faq', label: 'Гарантия и возврат' },
  { to: '/account', label: 'Личный кабинет' }
];

const about = [
  { to: '/about', label: 'О компании' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/contacts#pickup', label: 'Пункт самовывоза' },
  { to: '/favorites', label: 'Избранное' }
];

const payments = ['МИР', 'Visa', 'Mastercard', 'СБП'];

export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const subscribe = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Введите адрес почты, например name@mail.ru');
      return;
    }
    setError('');
    setEmail('');
    toast('Готово! Будем присылать скидки и новинки', 'bi-envelope-check-fill');
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div>
            <h2 className="site-footer__promo">Скидки и новинки — первыми</h2>
            <p className="site-footer__text mb-0">Одно письмо в неделю, без спама. Отписаться можно в любой момент.</p>
          </div>
          <form className="subscribe" onSubmit={subscribe} noValidate>
            <label htmlFor="subscribe-email" className="visually-hidden">Ваша почта</label>
            <input
              id="subscribe-email"
              type="email"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              placeholder="Ваша почта"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'subscribe-error' : undefined}
            />
            <button type="submit" className="btn btn-accent">Подписаться</button>
            {error && <p className="subscribe__error" id="subscribe-error">{error}</p>}
          </form>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <Link to="/" className="d-inline-block mb-3"><Logo light /></Link>
            <p className="site-footer__text">Магазин гаджетов и аксессуаров с {company.founded} года. Привозим технику для работы, учёбы и отдыха, даём гарантию и помогаем с выбором.</p>
            <ul className="list-unstyled site-footer__social" aria-label="Мы в соцсетях">
              <li><a href="https://t.me/" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><i className="bi bi-telegram" aria-hidden="true"></i></a></li>
              <li><a href="https://vk.com/" target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте"><i className="bi bi-chat-square-heart" aria-hidden="true"></i></a></li>
              <li><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i className="bi bi-youtube" aria-hidden="true"></i></a></li>
              <li><a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="bi bi-whatsapp" aria-hidden="true"></i></a></li>
            </ul>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <h2 className="site-footer__title">Покупателям</h2>
            <ul className="list-unstyled site-footer__links">
              {buyers.map((l) => <li key={l.label}><Link to={l.to}>{l.label}</Link></li>)}
            </ul>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <h2 className="site-footer__title">Компания</h2>
            <ul className="list-unstyled site-footer__links">
              {about.map((l) => <li key={l.label}><Link to={l.to}>{l.label}</Link></li>)}
            </ul>
          </div>
          <div className="col-12 col-md-5 col-lg-4">
            <h2 className="site-footer__title">Связаться</h2>
            <ul className="list-unstyled site-footer__links site-footer__contacts">
              <li>
                <i className="bi bi-geo-alt" aria-hidden="true"></i>
                <span>{company.address}</span>
              </li>
              <li>
                <i className="bi bi-telephone" aria-hidden="true"></i>
                <span><a href={company.phone.href} className="text-nowrap">{company.phone.text}</a><small>по Москве</small></span>
              </li>
              <li>
                <i className="bi bi-clock" aria-hidden="true"></i>
                <span>{company.hours}</span>
              </li>
              <li>
                <i className="bi bi-envelope" aria-hidden="true"></i>
                <a href={company.email.href}>{company.email.text}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__copy">
          <span>© {company.founded}–2026 {company.name}. Все права защищены.</span>
          <ul className="list-unstyled payments" aria-label="Способы оплаты">
            {payments.map((p) => <li key={p} className="payments__item">{p}</li>)}
          </ul>
          <Link to="/contacts#privacy" className="site-footer__legal">Политика конфиденциальности</Link>
        </div>
      </div>
    </footer>
  );
}
