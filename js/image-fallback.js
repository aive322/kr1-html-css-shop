// Фотографии товаров лежат в папке images/photos/ (адрес в атрибуте data-photo).
// В src каждой картинки указана запасная иллюстрация из images/, поэтому
// изображение видно всегда. Фото подставляется, когда файл успешно загрузился.
document.querySelectorAll('img[data-photo]').forEach((image) => {
  const loader = new Image();

  loader.addEventListener('load', () => {
    image.src = loader.src;
  });

  loader.src = image.dataset.photo;
});
