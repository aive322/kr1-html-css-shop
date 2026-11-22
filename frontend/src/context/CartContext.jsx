import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save } from '../utils/storage.js';
import { useProducts } from './ProductsContext.jsx';
import { useToast } from './ToastContext.jsx';
import { DELIVERY_PRICE, FREE_DELIVERY_FROM } from '../data/company.js';

const CartContext = createContext(null);
const KEY = 'tm-cart';
const MAX_QTY = 10;

// Корзина: список { id, qty } в localStorage. Цены всегда берутся из актуального каталога.
export function CartProvider({ children }) {
  const { products } = useProducts();
  const toast = useToast();
  const [items, setItems] = useState(() => {
    const stored = load(KEY, []);
    return Array.isArray(stored) ? stored.filter((i) => i && Number.isInteger(i.id) && i.qty > 0) : [];
  });

  useEffect(() => {
    save(KEY, items);
  }, [items]);

  const add = useCallback((product, qty = 1) => {
    if (!product.isAvailable) return;
    setItems((list) => {
      const found = list.find((i) => i.id === product.id);
      if (found) return list.map((i) => (i.id === product.id ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i));
      return [...list, { id: product.id, qty: Math.min(MAX_QTY, qty) }];
    });
    toast(`«${product.title}» в корзине`, 'bi-bag-check-fill');
  }, [toast]);

  const setQty = useCallback((id, qty) => {
    const value = Math.max(1, Math.min(MAX_QTY, Number(qty) || 1));
    setItems((list) => list.map((i) => (i.id === id ? { ...i, qty: value } : i)));
  }, []);

  const removeItem = useCallback((id) => setItems((list) => list.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  // Позиции с данными товара; товары, которых нет в каталоге или нет в наличии, пропускаем.
  const lines = useMemo(() => items
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.id) }))
    .filter((l) => l.product && l.product.isAvailable), [items, products]);

  const totals = useMemo(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const oldTotal = lines.reduce((s, l) => s + (l.product.oldPrice || l.product.price) * l.qty, 0);
    const delivery = subtotal >= FREE_DELIVERY_FROM || subtotal === 0 ? 0 : DELIVERY_PRICE;
    return { count, subtotal, savings: oldTotal - subtotal, delivery, total: subtotal + delivery };
  }, [lines]);

  const has = useCallback((id) => items.some((i) => i.id === id), [items]);

  const value = useMemo(() => ({ items, lines, totals, add, setQty, removeItem, clear, has, MAX_QTY }),
    [items, lines, totals, add, setQty, removeItem, clear, has]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
