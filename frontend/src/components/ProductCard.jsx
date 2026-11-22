import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import ProductBadge from './ProductBadge.jsx';
import FavoriteButton from './FavoriteButton.jsx';
import Rating from './Rating.jsx';
import CartButton from './CartButton.jsx';
import { formatPrice } from '../utils/price.js';

export default function ProductCard({ product, headingLevel = 3, eager = false }) {
  const Heading = `h${headingLevel}`;
  return (
    <article className={`product-card h-100 ${product.isAvailable ? '' : 'is-soldout'}`}>
      <div className="product-card__media">
        <Link to={`/product/${product.id}`} tabIndex={-1} aria-hidden="true">
          <ProductImage
            product={product}
            className="product-card__image"
            eager={eager}
            sizes="(min-width: 1200px) 260px, (min-width: 992px) 30vw, (min-width: 576px) 45vw, 90vw"
          />
        </Link>
        <ProductBadge product={product} className="product-card__badge" />
        <FavoriteButton product={product} className="product-card__fav" />
      </div>
      <div className="product-card__body">
        <Heading className="product-card__title">
          <Link to={`/product/${product.id}`} className="stretched-title">{product.title}</Link>
        </Heading>
        <p className="product-card__text">{product.shortDescription}</p>
        <Rating value={product.rating} count={product.reviewsCount} />
        <div className="product-card__footer">
          <p className="product-card__price mb-0">
            <span className={product.oldPrice ? 'text-sale' : ''}>{formatPrice(product.price)}</span>
            {product.oldPrice > 0 && (
              <s className="product-card__old"><span className="visually-hidden">Старая цена: </span>{formatPrice(product.oldPrice)}</s>
            )}
          </p>
          {product.isAvailable ? (
            <CartButton product={product} />
          ) : (
            <span className="soldout-note">Нет в наличии</span>
          )}
        </div>
      </div>
    </article>
  );
}
