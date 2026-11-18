// Адаптивное поведение: кнопка меню на узких экранах и сворачиваемый фильтр каталога.
// Без JavaScript меню остаётся полностью видимым, а фильтр — раскрытым.

const toggle = document.querySelector('.site-nav__toggle');
const navList = document.getElementById('site-nav-list');
// Меню в одну строку помещается с 1100px, боковой фильтр появляется с 1024px.
const wideQuery = window.matchMedia('(min-width: 1100px)');
const desktopQuery = window.matchMedia('(min-width: 1024px)');

// Закрывает меню и возвращает кнопку в исходное состояние.
function closeMenu() {
  navList.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
}

if (toggle && navList) {
  toggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Клавиша Escape закрывает меню, фокус возвращается на кнопку.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navList.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // После выбора пункта меню (например, якорной ссылки) закрываем его.
  navList.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      closeMenu();
    }
  });

  // При переходе на широкий экран меню показывается всегда.
  wideQuery.addEventListener('change', closeMenu);
}

// Фильтр каталога: на телефоне свёрнут, на компьютере всегда раскрыт.
const filters = document.getElementById('filters-details');

if (filters) {
  const syncFilters = () => {
    filters.open = desktopQuery.matches;
  };

  syncFilters();
  desktopQuery.addEventListener('change', syncFilters);

  // На компьютере закрыть фильтр с клавиатуры нельзя.
  filters.addEventListener('toggle', () => {
    if (desktopQuery.matches && !filters.open) {
      filters.open = true;
    }
  });
}
