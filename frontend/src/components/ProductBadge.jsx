const types = {
  featured: 'badge-hit',
  new: 'badge-new',
  discount: 'badge-discount',
  'sold-out': 'badge-soldout'
};

export default function ProductBadge({ product, className = '' }) {
  if (!product.badge) return null;
  return <span className={`product-badge ${types[product.badgeType] || ''} ${className}`}>{product.badge}</span>;
}
