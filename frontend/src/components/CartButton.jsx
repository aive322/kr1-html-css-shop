import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

// Кнопка «В корзину». Если товар уже в корзине — ссылка «В корзине».
export default function CartButton({ product, size = 'sm', className = '' }) {
  const { add, has } = useCart();
  const sizeClass = size ? `btn-${size}` : '';
  if (has(product.id)) {
    return (
      <Link className={`btn btn-outline-primary ${sizeClass} ${className}`} to="/cart" aria-label={`${product.title} уже в корзине — перейти в корзину`}>
        <i className="bi bi-bag-check-fill me-1" aria-hidden="true"></i>В корзине
      </Link>
    );
  }
  return (
    <button type="button" className={`btn btn-primary ${sizeClass} ${className}`} onClick={() => add(product)} aria-label={`В корзину: ${product.title}`}>
      <i className="bi bi-bag-plus me-1" aria-hidden="true"></i>В корзину
    </button>
  );
}
