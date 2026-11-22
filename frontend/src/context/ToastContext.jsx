import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

// Всплывающие уведомления в углу экрана («Добавлено в корзину» и т. п.).
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const close = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback((text, icon = 'bi-check-circle-fill') => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-2), { id, text, icon }]);
    setTimeout(() => close(id), 4000);
  }, [close]);

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className="site-toast" key={t.id}>
            <i className={`bi ${t.icon}`} aria-hidden="true"></i>
            <span>{t.text}</span>
            <button type="button" className="site-toast__close" aria-label="Закрыть уведомление" onClick={() => close(t.id)}>
              <i className="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
