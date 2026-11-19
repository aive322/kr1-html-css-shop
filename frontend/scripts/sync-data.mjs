// Копирует список товаров backend/data/products.json -> public/products.json.
// Это запасной вариант, если Go-сервер недоступен (например, на GitHub Pages).
// Так данные о товарах хранятся в одном месте — у бэкенда.
import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const from = fileURLToPath(new URL('../../backend/data/products.json', import.meta.url));
const to = fileURLToPath(new URL('../public/products.json', import.meta.url));
copyFileSync(from, to);
console.log('products.json скопирован из backend/data в frontend/public');
