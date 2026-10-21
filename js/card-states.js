// Состояние «В избранное» для карточек товаров.
// Кнопка-переключатель хранит состояние в aria-pressed,
// а карточка получает модификатор product-card--selected.
const toggleButtons = document.querySelectorAll('.button--toggle');

toggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const isPressed = button.getAttribute('aria-pressed') === 'true';
    const nextState = !isPressed;
    const card = button.closest('.product-card');

    button.setAttribute('aria-pressed', String(nextState));
    button.textContent = nextState ? '★' : '☆';

    if (card) {
      card.classList.toggle('product-card--selected', nextState);
    }
  });
});
