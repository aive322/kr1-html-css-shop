import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '../context/AccountContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader from '../components/PageHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import { company, departments, pickupSchedule, DELIVERY_PRICE, FREE_DELIVERY_FROM } from '../data/company.js';
import { formatPrice } from '../utils/price.js';

const contacts = [
  { icon: 'bi-telephone', title: 'Телефон в Москве', value: company.phone.text, href: company.phone.href, note: company.hours },
  { icon: 'bi-headset', title: 'Горячая линия', value: company.hotline.text, href: company.hotline.href, note: 'Бесплатно по России, круглосуточно' },
  { icon: 'bi-envelope', title: 'Почта', value: company.email.text, href: company.email.href, note: 'Отвечаем в течение часа' },
  { icon: 'bi-telegram', title: 'Telegram', value: '@tehnomarket_help', href: 'https://t.me/', note: 'Чат с консультантом' }
];

const delivery = [
  { icon: 'bi-truck', title: 'Курьером по Москве', text: `На следующий день, с 10:00 до 22:00. ${formatPrice(DELIVERY_PRICE)}, от ${formatPrice(FREE_DELIVERY_FROM)} — бесплатно.` },
  { icon: 'bi-shop', title: 'Самовывоз', text: 'Бесплатно, на следующий день после заказа. Заказ хранится 7 дней.' },
  { icon: 'bi-box-seam', title: 'По России', text: 'Транспортной компанией за 2–7 дней. Стоимость менеджер назовёт при подтверждении.' },
  { icon: 'bi-wallet2', title: 'Оплата', text: 'При получении: картой МИР, Visa, Mastercard, по QR-коду СБП или наличными.' }
];

const faq = [
  { q: 'Как оформить заказ?', a: 'Добавьте товары в корзину, нажмите «Перейти к оформлению» и заполните контакты. Менеджер позвонит в течение 15 минут, чтобы подтвердить заказ.' },
  { q: 'Можно ли посмотреть товар перед покупкой?', a: 'Да. Приходите в магазин — всё, что есть в наличии, можно подержать в руках и проверить. Курьер тоже ждёт, пока вы осмотрите заказ.' },
  { q: 'Какая гарантия на товары?', a: 'На все товары действует гарантия от 12 месяцев — точный срок указан в характеристиках. Ремонт делает наш сервисный центр.' },
  { q: 'Как вернуть товар?', a: 'В течение 14 дней, если товар не был в использовании и сохранена упаковка. Привезите его в магазин или вызовите курьера — деньги вернём в тот же день.' },
  { q: 'Работаете ли вы с юридическими лицами?', a: 'Да, отдел для бизнеса выставит счёт с НДС, подготовит закрывающие документы и привезёт технику в офис.' }
];

const topics = ['Вопрос о товаре', 'Статус заказа', 'Гарантия и ремонт', 'Сотрудничество', 'Другое'];

function FeedbackForm() {
  const { user } = useAccount();
  const toast = useToast();
  const empty = { name: user?.name ?? '', contact: user?.email ?? '', topic: topics[0], message: '' };
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const change = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (values.name.trim().length < 2) er.name = 'Введите имя (не менее 2 символов).';
    const c = values.contact.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) && !/^\+?[78][\d\s()-]{9,}$/.test(c)) er.contact = 'Укажите почту или телефон, чтобы мы могли ответить.';
    if (values.message.trim().length < 10) er.message = 'Опишите вопрос подробнее (от 10 символов).';
    setErrors(er);
    const first = Object.keys(er)[0];
    if (first) {
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    toast('Сообщение отправлено — ответим в течение часа', 'bi-send-check-fill');
    setValues({ ...empty, message: '' });
  };

  const fieldProps = (name) => ({
    id: `fb-${name}`,
    name,
    value: values[name],
    onChange: change,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `fb-${name}-error` : undefined
  });
  const err = (name) => errors[name] && <div className="invalid-feedback d-block" id={`fb-${name}-error`}>{errors[name]}</div>;

  return (
    <form ref={formRef} className="form-card h-100" onSubmit={submit} noValidate>
      <h2 className="h4 mb-3">Напишите нам</h2>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="fb-name">Имя</label>
          <input {...fieldProps('name')} className={`form-control ${errors.name ? 'is-invalid' : ''}`} autoComplete="name" />
          {err('name')}
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="fb-contact">Почта или телефон</label>
          <input {...fieldProps('contact')} className={`form-control ${errors.contact ? 'is-invalid' : ''}`} autoComplete="email" />
          {err('contact')}
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="fb-topic">Тема</label>
          <select {...fieldProps('topic')} className="form-select">
            {topics.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="fb-message">Сообщение</label>
          <textarea {...fieldProps('message')} rows="4" className={`form-control ${errors.message ? 'is-invalid' : ''}`} placeholder="Чем можем помочь?"></textarea>
          {err('message')}
        </div>
      </div>
      <button type="submit" className="btn btn-primary btn-lg mt-3"><i className="bi bi-send me-2" aria-hidden="true"></i>Отправить</button>
    </form>
  );
}

export default function Contacts() {
  usePageMeta('Контакты', 'Контакты магазина ТехноМаркет: телефоны, почта, адрес пункта самовывоза в Москве, режим работы, доставка и оплата.');
  return (
    <>
      <PageHeader title="Контакты" subtitle="Ответим на вопросы о товарах, заказах, доставке и гарантии" />

      <section className="section pt-4">
        <div className="container">
          <div className="row g-4">
            {contacts.map((item, index) => (
              <Reveal className="col-12 col-sm-6 col-lg-3" key={item.title} delay={index * 80}>
                <div className="feature contact-card h-100">
                  <span className="feature__icon" aria-hidden="true"><i className={`bi ${item.icon}`}></i></span>
                  <h2 className="feature__title">{item.title}</h2>
                  <p className="contact-card__value"><a href={item.href} {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{item.value}</a></p>
                  <p className="feature__text mb-0">{item.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint" id="pickup" tabIndex={-1} aria-labelledby="pickup-title">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <Reveal className="col-lg-5">
              <div className="pickup-card h-100">
                <h2 id="pickup-title" className="h3">Магазин и пункт самовывоза</h2>
                <p className="pickup-card__address"><i className="bi bi-geo-alt-fill" aria-hidden="true"></i>{company.address}</p>
                <table className="schedule">
                  <caption className="visually-hidden">Режим работы магазина</caption>
                  <tbody>
                    {pickupSchedule.map(([day, time]) => <tr key={day}><th scope="row">{day}</th><td>{time}</td></tr>)}
                  </tbody>
                </table>
                <h3 className="h6 mt-4">Как добраться</h3>
                <ul className="route-list">
                  <li><i className="bi bi-train-front" aria-hidden="true"></i>От метро «Электрозаводская» — 5 минут пешком, выход № 2</li>
                  <li><i className="bi bi-bus-front" aria-hidden="true"></i>Остановка «ТЦ Сигнал» — автобусы 32, 78, 552</li>
                  <li><i className="bi bi-p-square" aria-hidden="true"></i>Бесплатная парковка для покупателей — 2 часа</li>
                </ul>
              </div>
            </Reveal>
            <Reveal className="col-lg-7" delay={120} variant="zoom">
              <div className="map-card h-100" role="img" aria-label="Схема проезда: магазин в ТЦ «Сигнал», рядом метро «Электрозаводская»">
                <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <rect width="600" height="380" className="map-bg" />
                  <path d="M0 250 L600 210" className="map-road map-road--main" />
                  <path d="M180 0 L230 380" className="map-road" />
                  <path d="M420 0 L390 380" className="map-road" />
                  <path d="M0 90 L600 120" className="map-road" />
                  <path d="M60 330 Q 300 280 600 330" className="map-river" />
                  <rect x="250" y="130" width="120" height="70" rx="10" className="map-block" />
                  <rect x="40" y="130" width="110" height="80" rx="10" className="map-block map-block--park" />
                  <rect x="450" y="20" width="120" height="70" rx="10" className="map-block" />
                  <circle cx="205" cy="240" r="14" className="map-metro" />
                  <text x="205" y="245" textAnchor="middle" className="map-metro-text">М</text>
                  <path d="M215 232 L300 175" className="map-route" />
                  <g className="map-pin">
                    <path d="M310 168c0-16 12-28 28-28s28 12 28 28c0 22-28 46-28 46s-28-24-28-46z" />
                    <circle cx="338" cy="168" r="10" fill="#fff" />
                  </g>
                </svg>
                <div className="map-card__label">
                  <strong>ТЦ «Сигнал», 1 этаж</strong>
                  <span>Вход с ул. Электронной</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="departments-title">
        <div className="container">
          <h2 id="departments-title" className="section-title">Отделы</h2>
          <div className="row g-4 mt-1">
            {departments.map((d, i) => (
              <Reveal className="col-12 col-md-6 col-xl-3" key={d.title} delay={i * 80}>
                <div className="department h-100">
                  <span className="feature__icon" aria-hidden="true"><i className={`bi ${d.icon}`}></i></span>
                  <h3 className="feature__title">{d.title}</h3>
                  <p className="feature__text">{d.text}</p>
                  <ul className="list-unstyled department__list">
                    <li><i className="bi bi-telephone" aria-hidden="true"></i><a href={d.phone.href} className="text-nowrap">{d.phone.text}</a></li>
                    <li><i className="bi bi-envelope" aria-hidden="true"></i><a href={d.email.href}>{d.email.text}</a></li>
                    <li><i className="bi bi-clock" aria-hidden="true"></i>{d.hours}</li>
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint" id="delivery" tabIndex={-1} aria-labelledby="delivery-title">
        <div className="container">
          <h2 id="delivery-title" className="section-title">Доставка и оплата</h2>
          <div className="row g-4 mt-1">
            {delivery.map((d, i) => (
              <Reveal className="col-12 col-sm-6 col-lg-3" key={d.title} delay={i * 80}>
                <div className="feature h-100">
                  <span className="feature__icon" aria-hidden="true"><i className={`bi ${d.icon}`}></i></span>
                  <h3 className="feature__title">{d.title}</h3>
                  <p className="feature__text mb-0">{d.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="feedback" tabIndex={-1}>
        <div className="container">
          <div className="row g-4">
            <Reveal className="col-lg-7">
              <FeedbackForm />
            </Reveal>
            <Reveal className="col-lg-5" delay={120} id="faq" tabIndex={-1}>
              <h2 className="section-title h3">Частые вопросы</h2>
              <div className="faq">
                {faq.map((item) => (
                  <details className="faq__item" key={item.q}>
                    <summary className="faq__question">{item.q}</summary>
                    <p className="faq__answer">{item.a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--tint" id="privacy" tabIndex={-1} aria-labelledby="privacy-title">
        <div className="container">
          <div className="legal">
            <h2 id="privacy-title" className="h4">Политика конфиденциальности</h2>
            <p className="mb-0">Мы используем имя, телефон, почту и адрес только для оформления и доставки заказов и не передаём их третьим лицам, кроме службы доставки. Данные личного кабинета хранятся в вашем браузере. Чтобы удалить их, откройте <Link to="/account">личный кабинет</Link> → «Профиль» → «Удалить аккаунт и данные».</p>
          </div>
        </div>
      </section>
    </>
  );
}
