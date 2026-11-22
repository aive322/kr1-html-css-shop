import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader from '../components/PageHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import CountUp from '../components/CountUp.jsx';
import { LogoMark } from '../components/Logo.jsx';
import { company } from '../data/company.js';

const stats = [
  { value: 7, suffix: '', label: 'лет на рынке' },
  { value: 48000, suffix: '+', label: 'довольных покупателей' },
  { value: 1, suffix: ' день', label: 'средний срок доставки по Москве' },
  { value: 4.8, suffix: '', label: 'средняя оценка в отзывах', decimals: 1 }
];

const values = [
  { icon: 'bi-patch-check', title: 'Только оригинал', text: 'Работаем напрямую с официальными дистрибьюторами. На каждый товар — чек и фирменная гарантия.' },
  { icon: 'bi-cash-stack', title: 'Честная цена', text: 'Цена на сайте — окончательная. Никаких скрытых наценок, доставка от 5 000 ₽ бесплатная.' },
  { icon: 'bi-person-heart', title: 'Поможем выбрать', text: 'Консультанты сами пользуются техникой, которую продают, и подскажут без навязывания.' },
  { icon: 'bi-arrow-repeat', title: 'Лёгкий возврат', text: '14 дней на возврат без лишних вопросов. Деньги вернём в тот же день.' }
];

const timeline = [
  { year: '2019', title: 'Первый магазин', text: 'Открыли небольшой магазин аксессуаров у метро и продавали мыши, кабели и наушники.' },
  { year: '2020', title: 'Доставка по Москве', text: 'Запустили собственную курьерскую службу — привозим заказы на следующий день.' },
  { year: '2022', title: 'Сервисный центр', text: 'Открыли сервис для гарантийного ремонта, чтобы не отправлять технику производителю.' },
  { year: '2024', title: 'Отдел для бизнеса', text: 'Начали оснащать офисы и учебные классы: подбор, поставка и настройка техники.' },
  { year: '2026', title: 'Новый сайт', text: 'Запустили интернет-магазин с личным кабинетом, отзывами и оформлением заказа за минуту.' }
];

const team = [
  { name: 'Андрей Волков', role: 'Основатель и директор' },
  { name: 'Ольга Сидорова', role: 'Руководитель отдела продаж' },
  { name: 'Максим Ершов', role: 'Старший консультант' },
  { name: 'Наталья Белова', role: 'Служба поддержки' },
  { name: 'Кирилл Зайцев', role: 'Инженер сервисного центра' },
  { name: 'Екатерина Лебедева', role: 'Менеджер по работе с бизнесом' }
];

const initialsOf = (name) => name.split(' ').map((w) => w[0]).join('');

export default function About() {
  usePageMeta('О компании', 'ТехноМаркет — магазин гаджетов в Москве с 2019 года: оригинальная техника, гарантия, собственная доставка и сервисный центр.');
  return (
    <>
      <PageHeader title="О компании" subtitle={`Продаём гаджеты, которым доверяем сами, с ${company.founded} года`} />

      <section className="section pt-4">
        <div className="container">
          <div className="row g-4 g-lg-5 align-items-center">
            <Reveal className="col-lg-7">
              <p className="eyebrow">Кто мы</p>
              <h2 className="section-title">Техника без лишних сложностей</h2>
              <p className="lead-text">{company.name} начинался с маленькой точки с аксессуарами у метро. Сегодня у нас магазин и пункт выдачи в Москве, своя доставка, сервисный центр и тысячи покупателей по всей России.</p>
              <p className="lead-text">Мы не гонимся за огромным ассортиментом. В каталог попадает только то, что команда сама проверила: удобная мышь, наушники, которые не жмут, аккумулятор с честной ёмкостью. Если товар часто возвращают — убираем его с полки.</p>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link className="btn btn-primary btn-lg" to="/catalog">Смотреть каталог</Link>
                <Link className="btn btn-outline-primary btn-lg" to="/contacts">Как нас найти</Link>
              </div>
            </Reveal>
            <Reveal className="col-lg-5" variant="zoom" delay={120}>
              <div className="about-card">
                <LogoMark size={72} />
                <p className="about-card__quote">«Хорошая техника — та, о которой не приходится думать. Она просто работает».</p>
                <p className="about-card__author">Андрей Волков, основатель</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section pt-0" aria-label="Компания в цифрах">
        <div className="container">
          <dl className="stats stats--plain">
            {stats.map((s) => (
              <div className="stats__item" key={s.label}>
                <dt>{s.label}</dt>
                <dd><CountUp value={s.value} decimals={s.decimals ?? 0} format={(n) => `${s.decimals ? n : Number(n).toLocaleString('ru-RU')}${s.suffix}`} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="values-title">
        <div className="container">
          <h2 id="values-title" className="section-title">Наши принципы</h2>
          <div className="row g-4 mt-1">
            {values.map((v, i) => (
              <Reveal className="col-12 col-sm-6 col-lg-3" key={v.title} delay={i * 80}>
                <div className="feature h-100">
                  <span className="feature__icon" aria-hidden="true"><i className={`bi ${v.icon}`}></i></span>
                  <h3 className="feature__title">{v.title}</h3>
                  <p className="feature__text mb-0">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="history-title">
        <div className="container">
          <h2 id="history-title" className="section-title">Наш путь</h2>
          <ol className="timeline list-unstyled">
            {timeline.map((t, i) => (
              <Reveal as="li" className="timeline__item" key={t.year} delay={i * 80}>
                <span className="timeline__year">{t.year}</span>
                <div className="timeline__body">
                  <h3 className="timeline__title">{t.title}</h3>
                  <p className="mb-0">{t.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="team-title">
        <div className="container">
          <h2 id="team-title" className="section-title">Команда</h2>
          <div className="row g-4 mt-1">
            {team.map((m, i) => (
              <Reveal className="col-6 col-md-4 col-lg-2" key={m.name} delay={(i % 6) * 60}>
                <div className="team-card">
                  <span className="team-card__avatar" aria-hidden="true">{initialsOf(m.name)}</span>
                  <h3 className="team-card__name">{m.name}</h3>
                  <p className="team-card__role">{m.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <Reveal className="cta" variant="zoom">
            <div>
              <h2 className="cta__title">Приходите знакомиться</h2>
              <p className="cta__text">{company.address}. {company.hours}.</p>
            </div>
            <Link className="btn btn-accent btn-lg" to="/contacts#pickup">Как добраться</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
