import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ProductsContext = createContext(null);
const BASE = import.meta.env.BASE_URL;
// На GitHub Pages сервера нет, поэтому сразу берём файл (без лишней ошибки 404 в консоли).
const USE_API = import.meta.env.MODE !== 'pages';

async function loadJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`${url}: код ${response.status}`);
  }
  return response.json();
}

// Загружает товары с Go-сервера (GET /api/products).
// Если сервер недоступен (например, на GitHub Pages), берёт запасной файл products.json.
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [source, setSource] = useState(null); // api | file
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    (async () => {
      try {
        if (!USE_API) throw new Error('API отключён в сборке для GitHub Pages');
        const data = await loadJson('/api/products', controller.signal);
        setProducts(data);
        setSource('api');
        setStatus('ready');
      } catch (apiError) {
        if (apiError.name === 'AbortError') return;
        try {
          const data = await loadJson(`${BASE}products.json`, controller.signal);
          setProducts(data);
          setSource('file');
          setStatus('ready');
        } catch (fileError) {
          if (fileError.name !== 'AbortError') setStatus('error');
        }
      }
    })();

    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const value = useMemo(() => ({ products, status, source, reload }), [products, status, source, reload]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  return useContext(ProductsContext);
}
