// Фотографии товаров лежат в папке images/photos/ (в нескольких размерах и форматах).
// Если фотография не загрузилась, подставляется запасная иллюстрация из images/
// (адрес указан в атрибуте data-fallback), поэтому картинка видна всегда.
function useFallback(image) {
  const fallback = image.dataset.fallback;

  if (!fallback || image.dataset.fallbackUsed) {
    return;
  }

  image.dataset.fallbackUsed = 'true';
  // Убираем srcset и родительский picture-источник, иначе браузер снова выберет фото.
  image.removeAttribute('srcset');
  const picture = image.closest('picture');
  if (picture) {
    picture.querySelectorAll('source').forEach((source) => source.remove());
  }
  image.src = fallback;
}

document.querySelectorAll('img[data-fallback]').forEach((image) => {
  image.addEventListener('error', () => useFallback(image));

  // Ошибка могла произойти до того, как скрипт начал работу.
  if (image.complete && image.naturalWidth === 0) {
    useFallback(image);
  }
});
