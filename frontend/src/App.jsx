import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Order from './pages/Order.jsx';
import Account from './pages/Account.jsx';
import About from './pages/About.jsx';
import Contacts from './pages/Contacts.jsx';
import Favorites from './pages/Favorites.jsx';
import NotFound from './pages/NotFound.jsx';
import { useProducts } from './context/ProductsContext.jsx';
import { useCart } from './context/CartContext.jsx';

// Старый адрес /order?product=3 — кладём товар в корзину и открываем её.
function LegacyOrder() {
  const [params] = useSearchParams();
  const { products, status } = useProducts();
  const { add, has } = useCart();
  const navigate = useNavigate();
  useEffect(() => {
    if (status !== 'ready') return;
    const product = products.find((p) => String(p.id) === params.get('product'));
    if (product && product.isAvailable && !has(product.id)) add(product);
    navigate('/cart', { replace: true });
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="product/:id" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Order />} />
        <Route path="order" element={<LegacyOrder />} />
        <Route path="account" element={<Account />} />
        <Route path="about" element={<About />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
