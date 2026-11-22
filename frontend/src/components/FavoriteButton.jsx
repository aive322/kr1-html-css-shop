import { useFavorites } from '../context/FavoritesContext.jsx';

export default function FavoriteButton({ product, className = '' }) {
  const { has, toggle } = useFavorites();
  const active = has(product.id);
  return (
    <button
      type="button"
      className={`favorite-btn ${active ? 'is-active' : ''} ${className}`}
      aria-pressed={active}
      aria-label={`${active ? 'Убрать из избранного' : 'Добавить в избранное'}: ${product.title}`}
      onClick={() => toggle(product.id)}
    >
      <i className={`bi ${active ? 'bi-heart-fill' : 'bi-heart'}`} aria-hidden="true"></i>
    </button>
  );
}
