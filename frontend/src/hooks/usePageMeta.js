import { useEffect } from 'react';

const SITE = 'ТехноМаркет';

// SEO: у каждой страницы свой <title> и meta description.
export default function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE}` : `${SITE} — гаджеты и аксессуары для работы и учёбы`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) {
      meta.setAttribute('content', description);
    }
  }, [title, description]);
}
