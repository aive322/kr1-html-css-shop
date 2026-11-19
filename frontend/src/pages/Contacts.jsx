import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader from '../components/PageHeader.jsx';

const contacts = [
  { icon: 'bi-telephone', title: 'Телефон', value: '+7 (900) 000-00-00', href: 'tel:+79000000000' },
  { icon: 'bi-envelope', title: 'E-mail', value: 'info@example.com', href: 'mailto:info@example.com' },
  { icon: 'bi-geo-alt', title: 'Адрес', value: 'г. Москва, учебный проект' },
  { icon: 'bi-clock', title: 'Режим работы', value: 'Ежедневно с 9:00 до 21:00' }
];

const faq = [
  { q: 'Как оформить заказ?', a: 'Нажмите «Заказать» в карточке товара или откройте страницу «Оформить заявку», заполните форму — менеджер свяжется с вами для подтверждения.' },
  { q: 'Сколько занимает доставка?', a: 'По городу доставляем за 1–2 дня, в другие регионы — до 7 дней. Точный срок менеджер назовёт при подтверждении заказа.' },
  { q: 'Есть ли гарантия на товары?', a: 'Да, на все товары действует гарантия от 12 месяцев. Срок указан в характеристиках каждого товара.' },
  { q: 'Как вернуть товар?', a: 'Товар можно вернуть в течение 14 дней, если он не был в использовании. Свяжитесь с нами по телефону или e-mail.' }
];

export default function Contacts() {
  usePageMeta('Контакты', 'Контакты интернет-магазина ТехноМаркет: телефон, e-mail, адрес, режим работы и ответы на частые вопросы.');
  return (
    <>
      <PageHeader title="Контакты" subtitle="Ответим на вопросы о товарах, доставке и гарантии" />
      <section className="section pt-4">
        <div className="container">
          <div className="row g-4">
            {contacts.map((item) => (
              <div className="col-12 col-sm-6 col-lg-3" key={item.title}>
                <div className="feature h-100">
                  <span className="feature__icon" aria-hidden="true"><i className={`bi ${item.icon}`}></i></span>
                  <h2 className="feature__title">{item.title}</h2>
                  <p className="feature__text mb-0">{item.href ? <a href={item.href}>{item.value}</a> : item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mt-4">
            <div className="col-lg-7">
              <h2 className="section-title h3">Частые вопросы</h2>
              <div className="faq">
                {faq.map((item) => (
                  <details className="faq__item" key={item.q}>
                    <summary className="faq__question">{item.q}</summary>
                    <p className="faq__answer">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div className="col-lg-5">
              <div className="cta cta--stack h-100">
                <div>
                  <h2 className="cta__title">Нужна консультация?</h2>
                  <p className="cta__text">Оставьте заявку — подберём товар и ответим на вопросы.</p>
                </div>
                <Link className="btn btn-accent btn-lg" to="/order">Оставить заявку</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
