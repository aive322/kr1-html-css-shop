import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import BackToTop from './BackToTop.jsx';
import ConsultantChat from './ConsultantChat.jsx';

export default function Layout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  // При переходе на другую страницу: прокрутка наверх и фокус на <main>,
  // чтобы пользователь клавиатуры и экранного диктора начинал с содержимого.
  useEffect(() => {
    // Ссылка с якорем (например, /contacts#delivery) — прокручиваем к нужному блоку.
    if (hash) {
      const timer = setTimeout(() => {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.focus?.({ preventScroll: true });
        }
      }, 80);
      firstRender.current = false;
      return () => clearTimeout(timer);
    }
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
    return undefined;
  }, [pathname, hash]);

  return (
    <>
      <a className="skip-link" href="#main">Перейти к основному содержимому</a>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="site-main">
        {/* key меняется при переходе — новая страница плавно появляется */}
        <div key={pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BackToTop />
      <ConsultantChat />
    </>
  );
}
