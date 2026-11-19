import { useProducts } from '../context/ProductsContext.jsx';

// Сообщение о загрузке товаров или об ошибке связи с Go-сервером.
export default function LoadState() {
  const { status, reload } = useProducts();
  if (status === 'loading') {
    return (
      <div className="load-state" role="status">
        <span className="spinner-border spinner-border-sm text-primary me-2" aria-hidden="true"></span>
        Загружаем товары…
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="alert alert-warning load-state-error" role="alert">
        <h2 className="h5">Не удалось загрузить товары</h2>
        <p className="mb-2">Не отвечает ни сервер на Go, ни запасной файл. Запустите сервер командой <code>go run .</code> в папке <code>backend</code> и попробуйте снова.</p>
        <button type="button" className="btn btn-outline-dark btn-sm" onClick={reload}>Повторить</button>
      </div>
    );
  }
  return null;
}
