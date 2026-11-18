// ===============================
// Практическая работа 15: товар, операторы и функции
// Объекты product и soldOutProduct создаются в js/data.js (он подключён раньше).
// ===============================

console.log('Файл main.js подключён');
console.log(product);
console.table(product);

// Форматирует цену: 2000 -> «2000 руб.»
function formatPrice(price) {
  return `${price} руб.`;
}

// Размер скидки в рублях (арифметика: * и /).
function calculateDiscount(price, discountPercent) {
  return price * discountPercent / 100;
}

// Цена со скидкой (арифметика: -). Использует calculateDiscount,
// поэтому формула скидки хранится только в одном месте.
function calculateFinalPrice(price, discountPercent) {
  const discountValue = calculateDiscount(price, discountPercent);
  return price - discountValue;
}

// Статус товара: логическое И (&&) и сравнение (>) в одном условии.
function getProductStatus(product) {
  if (product.isAvailable && product.price > 0) {
    return 'В наличии';
  }
  return 'Нет в наличии';
}

// Краткое описание: собирает строку из данных товара и результатов других функций.
function createProductSummary(product) {
  const finalPrice = calculateFinalPrice(product.price, product.discountPercent);
  const status = getProductStatus(product);
  const discountText = product.discountPercent > 0 ? ` (скидка ${product.discountPercent}%)` : '';
  return `${product.title}: ${formatPrice(finalPrice)}${discountText}, статус: ${status}.`;
}

// --- Проверка в консоли ---
console.log('--- Типы данных ---');
console.log('Название:', typeof product.title);         // string
console.log('Цена:', typeof product.price);             // number
console.log('В наличии:', typeof product.isAvailable);  // boolean
console.log('Товар:', typeof product);                  // object

console.log('--- Расчёты ---');
const discountValue = calculateDiscount(product.price, product.discountPercent);
const finalPrice = calculateFinalPrice(product.price, product.discountPercent);
console.log('Цена:', formatPrice(product.price));
console.log('Скидка:', formatPrice(discountValue));
console.log('Цена со скидкой:', formatPrice(finalPrice));

console.log('--- Сравнение и логические операторы ---');
const hasDiscount = product.discountPercent > 0;               // true
const canBuy = product.price > 0 && product.isAvailable;       // true
const isPriceChanged = finalPrice !== product.price;           // true
const needsAttention = !product.isAvailable || product.rating < 4; // false
console.log('Есть скидка:', hasDiscount);
console.log('Можно купить:', canBuy);
console.log('Цена изменилась:', isPriceChanged);
console.log('Нужно внимание (нет в наличии или низкий рейтинг):', needsAttention);

console.log('--- Статус и описание ---');
console.log(getProductStatus(product));
console.log(createProductSummary(product));
console.log(createProductSummary(soldOutProduct));

// ===============================
// Модальное окно заявки (практическая работа 3, главная страница).
// Код выполняется только там, где есть окно: main.js теперь можно
// подключать и на других страницах без ошибок в консоли.
// ===============================
const orderDialog = document.getElementById('order-dialog');

if (orderDialog) {

  // Получаем все кнопки заказа в карточках товаров.
  const orderButtons = document.querySelectorAll('.product-card__button');

  // Получаем кнопку закрытия модального окна.
  const closeDialogButton = document.getElementById('close-order-dialog');

  // Получаем скрытое поле, в которое будет записан выбранный товар.
  const selectedProductInput = document.getElementById('selected-product');

  // Перебираем все кнопки «Заказать».
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Получаем название товара из data-атрибута.
      const productName = button.dataset.product;
      // Записываем название товара в скрытое поле формы.
      selectedProductInput.value = productName;
      // Открываем модальное окно.
      orderDialog.showModal();
    });
  });

  // Закрываем модальное окно по кнопке «Закрыть».
  closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
  });
  // Получаем форму заявки.
  const orderForm = document.getElementById('order-form');

  // Получаем сообщение об успешной отправке.
  const successMessage = document.getElementById('success-message');

  // Обрабатываем отправку формы.
  orderForm.addEventListener('submit', (event) => {
    // Отменяем стандартную отправку формы,
    // потому что backend пока не подключён.
    event.preventDefault();

    // Сбрасываем предыдущие признаки ошибок.
    const formElements = Array.from(orderForm.elements);
    formElements.forEach((element) => {
      if (element.willValidate) {
        element.removeAttribute('aria-invalid');
      }
    });

    // Проверяем встроенные HTML-ограничения формы.
    if (!orderForm.checkValidity()) {
      formElements.forEach((element) => {
        if (element.willValidate && !element.checkValidity()) {
          element.setAttribute('aria-invalid', 'true');
        }
      });
      // Показываем стандартные сообщения браузера.
      orderForm.reportValidity();
      return;
    }

    // Показываем сообщение об успешной отправке.
    successMessage.hidden = false;
      // Прокручиваем страницу к сообщению, чтобы пользователь его сразу увидел.
    successMessage.scrollIntoView({ behavior: 'smooth' });
    // Очищаем форму.
    orderForm.reset();
    // Закрываем модальное окно.
    orderDialog.close();
  });
}
