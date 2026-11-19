// Адаптивная картинка товара: WebP + JPEG, две ширины (320 px и исходная).
export default function ProductImage({ product, sizes, className = '', eager = false, alt }) {
  const base = `${import.meta.env.BASE_URL}images/photos/${product.image}`;
  const full = product.imageWidth;
  return (
    <picture>
      <source type="image/webp" srcSet={`${base}-320.webp 320w, ${base}.webp ${full}w`} sizes={sizes} />
      <img
        className={className}
        src={`${base}.jpg`}
        srcSet={`${base}-320.jpg 320w, ${base}.jpg ${full}w`}
        sizes={sizes}
        width={product.imageWidth}
        height={product.imageHeight}
        alt={alt ?? product.title}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
      />
    </picture>
  );
}
