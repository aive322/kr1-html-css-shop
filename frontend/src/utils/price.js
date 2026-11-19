// Функции из практической работы 15 (цена, скидка, статус, краткое описание),
// перенесённые в React-версию.

// 2500 -> «2 500 ₽»
export function formatPrice(price) {
  return `${new Intl.NumberFormat('ru-RU').format(price)} ₽`;
}

// Процент скидки по старой и текущей цене.
export function calculateDiscountPercent(oldPrice, price) {
  if (!oldPrice || oldPrice <= price) {
    return 0;
  }
  return Math.round(((oldPrice - price) * 100) / oldPrice);
}

// Статус товара: логическое И и сравнение в одном условии.
export function getProductStatus(product) {
  if (product.isAvailable && product.price > 0) {
    return 'В наличии';
  }
  return 'Нет в наличии';
}

// Краткое описание товара одной строкой.
export function createProductSummary(product) {
  const discountText = product.discountPercent > 0 ? ` (скидка ${product.discountPercent}%)` : '';
  return `${product.title}: ${formatPrice(product.price)}${discountText}, ${getProductStatus(product).toLowerCase()}.`;
}

// Склонение: 1 товар, 2 товара, 5 товаров.
export function pluralize(count, one, few, many) {
  const n = Math.abs(count) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}
