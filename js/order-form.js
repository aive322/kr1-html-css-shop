// Доступная валидация формы на странице order.html.
// Идея: вместо всплывающих подсказок браузера показываем понятные сообщения
// рядом с полем и общий список ошибок, а фокус переводим на первое неверное поле.

const form = document.getElementById('page-order-form');
const summary = document.getElementById('order-form-summary');
const success = document.getElementById('page-order-success');

// Тексты ошибок для разных типов нарушений.
function getMessage(field) {
  const label = field.labels[0] ? field.labels[0].textContent.replace('*', '').trim() : field.name;
  const v = field.validity;
  if (v.valueMissing) {
    return field.type === 'checkbox'
      ? 'Подтвердите согласие на обработку данных.'
      : 'Заполните поле «' + label + '».';
  }
  if (v.typeMismatch) return 'Введите корректный e-mail, например example@mail.ru.';
  if (v.patternMismatch) return 'Введите телефон в формате +7 (900) 000-00-00.';
  if (v.tooShort) return 'В поле «' + label + '» должно быть не менее ' + field.minLength + ' символов.';
  return 'Проверьте поле «' + label + '».';
}

// Показываем ошибку рядом с полем и связываем её через aria-describedby.
function showError(field) {
  const errorId = field.id + '-error';
  let error = document.getElementById(errorId);
  if (!error) {
    error = document.createElement('p');
    error.className = 'order-form__error';
    error.id = errorId;
    field.closest('.order-form__field').appendChild(error);
  }
  error.textContent = getMessage(field);
  field.setAttribute('aria-invalid', 'true');

  const base = field.dataset.describedby || field.getAttribute('aria-describedby') || '';
  field.dataset.describedby = base;
  field.setAttribute('aria-describedby', (base + ' ' + errorId).trim());
  return error.textContent;
}

function clearError(field) {
  const error = document.getElementById(field.id + '-error');
  if (error) error.remove();
  field.removeAttribute('aria-invalid');
  const base = field.dataset.describedby;
  if (base !== undefined) {
    if (base) field.setAttribute('aria-describedby', base);
    else field.removeAttribute('aria-describedby');
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  success.hidden = true;

  const fields = Array.from(form.elements).filter((el) => el.willValidate);
  const messages = [];
  let firstInvalid = null;

  fields.forEach((field) => {
    clearError(field);
    if (!field.checkValidity()) {
      messages.push({ field, text: showError(field) });
      if (!firstInvalid) firstInvalid = field;
    }
  });

  if (messages.length > 0) {
    // Общий список ошибок: скринридер озвучит его благодаря role="alert".
    summary.innerHTML = '<p><strong>Исправьте ошибки (' + messages.length + '):</strong></p><ul></ul>';
    const list = summary.querySelector('ul');
    messages.forEach(({ field, text }) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#' + field.id;
      link.textContent = text;
      li.appendChild(link);
      list.appendChild(li);
    });
    summary.hidden = false;
    firstInvalid.focus();
    return;
  }

  summary.hidden = true;
  form.reset();
  success.hidden = false;
  success.focus && success.setAttribute('tabindex', '-1');
  success.focus();
});

// Когда пользователь исправляет поле, убираем ошибку сразу.
form.addEventListener('input', (event) => {
  const field = event.target;
  if (field.getAttribute && field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) {
    clearError(field);
  }
});
