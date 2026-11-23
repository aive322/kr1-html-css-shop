import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import PageHeader from '../components/PageHeader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoadState from '../components/LoadState.jsx';
import Reveal from '../components/Reveal.jsx';

export default function Favorites() {
  usePageMeta('Избранное', 'Избранные товары в интернет-магазине ТехноМаркет.');
  const { products, status } = useProducts();
  const { ids } = useFavorites();
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <>
      <PageHeader title="Избранное" subtitle="Товары, которые вы отметили сердечком" />
      <section className="section pt-4">
        <div className="container">
          <LoadState />
          {status === 'ready' && (items.length > 0 ? (
            <div className="row g-4 mobile-card-grid">
              {items.map((p, index) => <Reveal className="col-12 col-sm-6 col-lg-4 col-xl-3" key={p.id} delay={(index % 4) * 70}><ProductCard product={p} headingLevel={2} /></Reveal>)}
            </div>
          ) : (
            <div className="empty-state pop-in">
              <i className="bi bi-heart" aria-hidden="true"></i>
              <h2 className="h5">Здесь пока пусто</h2>
              <p>Нажмите на сердечко в карточке товара, чтобы добавить его в избранное.</p>
              <Link className="btn btn-primary" to="/catalog">Перейти в каталог</Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
