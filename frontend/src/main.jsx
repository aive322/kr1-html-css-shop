import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Шрифт Manrope подключён локально через npm-пакет (без внешних CDN).
import '@fontsource/manrope/cyrillic-400.css';
import '@fontsource/manrope/cyrillic-600.css';
import '@fontsource/manrope/cyrillic-700.css';
import '@fontsource/manrope/cyrillic-800.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './styles/app.css';

import App from './App.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';

// GitHub Pages не знает адресов React Router (например, /catalog) и
// открывает 404.html, который перенаправляет на главную с ?p=catalog.
// Здесь возвращаем исходный адрес, чтобы открылась нужная страница.
const redirectPath = new URLSearchParams(window.location.search).get('p');
if (redirectPath) {
  window.history.replaceState(null, '', import.meta.env.BASE_URL + redirectPath.replace(/^\//, ''));
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <ProductsProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </ProductsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
