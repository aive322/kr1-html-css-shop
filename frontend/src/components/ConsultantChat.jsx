import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DELIVERY_PRICE, FREE_DELIVERY_FROM } from '../data/company.js';
import { formatPrice } from '../utils/price.js';

const topics = [
  { label: 'Самовывоз', match: /самовывоз|забрать|адрес|где.*магазин/i, answer: 'Самовывоз бесплатный. Забрать заказ можно на следующий день, он хранится 7 дней.', link: '/contacts#pickup' },
  { label: 'Доставка', match: /достав|курьер/i, answer: `Курьер по Москве привезёт заказ на следующий день с 10:00 до 22:00. Доставка стоит ${formatPrice(DELIVERY_PRICE)}, от ${formatPrice(FREE_DELIVERY_FROM)} — бесплатно. По России доставка занимает 2–7 дней.`, link: '/contacts#delivery' },
  { label: 'Оплата', match: /оплат|наличн|картой|сбп/i, answer: 'При получении можно оплатить заказ картой, по СБП или наличными.', link: '/contacts#delivery' },
  { label: 'Возврат и гарантия', match: /гаранти|возврат|вернуть|ремонт/i, answer: 'Срок гарантии указан в характеристиках товара. Условия возврата и контакты сервисного центра есть на странице «Контакты».', link: '/contacts#faq' },
  { match: /оформ|как.*заказ|как.*купить/i, answer: 'Добавьте товары в корзину и нажмите «Перейти к оформлению».', link: '/cart' },
  { match: /выбрать|подобрать|наличи|характеристик/i, answer: 'В каталоге можно отфильтровать товары по категории и цене. Характеристики и наличие указаны на странице товара.', link: '/catalog' }
];

const fallback = {
  answer: 'Пока могу подсказать по доставке, самовывозу, оплате, возврату и оформлению заказа. Другие вопросы можно посмотреть в разделе «Контакты».',
  link: '/contacts'
};

export default function ConsultantChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    if (open && log) log.scrollTop = log.scrollHeight;
  }, [open, messages]);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  function send(text) {
    const question = text.trim();
    if (!question) return;
    const reply = topics.find(({ match }) => match.test(question)) ?? fallback;
    setMessages((previous) => [...previous, { question, ...reply }]);
    setDraft('');
  }

  return (
    <div className="consultant">
      <button
        type="button"
        ref={launcherRef}
        className="btn btn-primary consultant__toggle"
        aria-expanded={open}
        aria-controls="consultant-chat"
        onClick={() => open ? close() : setOpen(true)}
      >
        <i className="bi bi-chat-dots me-2" aria-hidden="true"></i>Чат с консультантом
      </button>

      <section
        className="consultant__panel"
        id="consultant-chat"
        aria-labelledby="consultant-title"
        hidden={!open}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close();
        }}
      >
        <header className="consultant__header">
          <h2 id="consultant-title" className="h6 mb-0">Чат с консультантом</h2>
          <button type="button" className="btn btn-close" aria-label="Закрыть чат" onClick={close}></button>
        </header>

        <div className="consultant__log" ref={logRef} role="log" aria-label="Переписка" tabIndex={0}>
          <p className="consultant__reply">Здравствуйте! Я виртуальный консультант. Выберите тему или напишите вопрос.</p>
          {messages.map(({ question, answer, link }, index) => (
            <div key={index}>
              <p className="consultant__question"><span className="visually-hidden">Вы: </span>{question}</p>
              <p className="consultant__reply">
                <span className="visually-hidden">Консультант: </span>{answer}{' '}
                <Link to={link} onClick={() => setOpen(false)}>Подробнее</Link>
              </p>
            </div>
          ))}
        </div>

        <div className="consultant__topics" aria-label="Частые вопросы" role="group">
          {topics.filter(({ label }) => label).map(({ label }) => (
            <button key={label} type="button" className="btn btn-outline-primary btn-sm" onClick={() => send(label)}>{label}</button>
          ))}
        </div>

        <form className="consultant__form" onSubmit={(event) => { event.preventDefault(); send(draft); }}>
          <input ref={inputRef} className="form-control" aria-label="Ваш вопрос" placeholder="Ваш вопрос" value={draft} maxLength={300} onChange={(event) => setDraft(event.target.value)} />
          <button type="submit" className="btn btn-primary" aria-label="Отправить вопрос" disabled={!draft.trim()}>
            <i className="bi bi-send" aria-hidden="true"></i>
          </button>
        </form>
      </section>
    </div>
  );
}
