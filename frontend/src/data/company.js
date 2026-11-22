// Контакты магазина в одном месте: их используют шапка, подвал, «Контакты» и «О нас».
export const company = {
  name: 'ТехноМаркет',
  slogan: 'Гаджеты для работы, учёбы и отдыха',
  phone: { text: '+7 (495) 000-12-34', href: 'tel:+74950001234' },
  hotline: { text: '8 (800) 000-56-78', href: 'tel:+78000005678' },
  email: { text: 'info@tehnomarket.example', href: 'mailto:info@tehnomarket.example' },
  address: 'Москва, ул. Электронная, 12, ТЦ «Сигнал», 1 этаж',
  hours: 'Ежедневно с 9:00 до 21:00',
  founded: 2019
};

export const departments = [
  { icon: 'bi-bag-check', title: 'Отдел продаж', text: 'Поможем выбрать товар и оформить заказ.', phone: { text: '+7 (495) 000-12-34', href: 'tel:+74950001234' }, email: { text: 'sales@tehnomarket.example', href: 'mailto:sales@tehnomarket.example' }, hours: 'Ежедневно 9:00–21:00' },
  { icon: 'bi-headset', title: 'Служба поддержки', text: 'Статус заказа, доставка, возврат.', phone: { text: '8 (800) 000-56-78', href: 'tel:+78000005678' }, email: { text: 'support@tehnomarket.example', href: 'mailto:support@tehnomarket.example' }, hours: 'Круглосуточно' },
  { icon: 'bi-tools', title: 'Сервисный центр', text: 'Гарантийный ремонт и диагностика.', phone: { text: '+7 (495) 000-90-12', href: 'tel:+74950009012' }, email: { text: 'service@tehnomarket.example', href: 'mailto:service@tehnomarket.example' }, hours: 'Пн–Пт 10:00–19:00' },
  { icon: 'bi-building', title: 'Для бизнеса', text: 'Оптовые заказы и оснащение офисов.', phone: { text: '+7 (495) 000-34-56', href: 'tel:+74950003456' }, email: { text: 'b2b@tehnomarket.example', href: 'mailto:b2b@tehnomarket.example' }, hours: 'Пн–Пт 9:00–18:00' }
];

export const pickupSchedule = [
  ['Понедельник — пятница', '9:00 – 21:00'],
  ['Суббота', '10:00 – 21:00'],
  ['Воскресенье', '10:00 – 20:00']
];

export const DELIVERY_PRICE = 300;
export const FREE_DELIVERY_FROM = 5000;
