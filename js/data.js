// Данные магазина (практическая работа 15).
// Подключается в HTML раньше main.js, потому что main.js использует эти объекты.

// Объект товара: Power Bank 20000 (так же он показан в каталоге).
const product = {
  id: 3,                         // number  – уникальный номер товара
  title: 'Power Bank 20000',     // string  – название
  category: 'accessories',       // string  – категория
  price: 2500,                   // number  – цена без скидки, руб.
  discountPercent: 20,           // number  – скидка, %
  rating: 4.8,                   // number  – средняя оценка из отзывов
  isAvailable: true              // boolean – есть ли товар в наличии
};

// Второй товар нужен, чтобы проверить ветку «нет в наличии» (Планшет Tab 10).
const soldOutProduct = {
  id: 9,
  title: 'Планшет Tab 10',
  category: 'tablets',
  price: 5000,
  discountPercent: 0,
  rating: 4.8,
  isAvailable: false
};
