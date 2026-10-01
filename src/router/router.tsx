// Petit routeur basé sur l'History API : pas de dépendance, compatible avec le pré-rendu.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { normalizePath } from '../routes';

interface RouterValue {
  path: string;
  search: string;
  hash: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

function readLocation() {
  return {
    path: normalizePath(window.location.pathname),
    search: window.location.search,
    hash: window.location.hash,
  };
}

export function RouterProvider({ url, children }: { url: string; children: ReactNode }) {
  const [location, setLocation] = useState(() => {
    const [pathAndSearch, hash = ''] = url.split('#');
    const [path, search = ''] = pathAndSearch.split('?');
    return { path: normalizePath(path), search: search ? `?${search}` : '', hash: hash ? `#${hash}` : '' };
  });

  useEffect(() => {
    const onPop = () => setLocation(readLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string, options: { replace?: boolean } = {}) => {
    const target = new URL(to, window.location.href);
    if (target.origin !== window.location.origin) {
      window.location.href = to;
      return;
    }
    const samePage = normalizePath(target.pathname) === normalizePath(window.location.pathname);
    if (options.replace) window.history.replaceState(null, '', target.pathname + target.search + target.hash);
    else window.history.pushState(null, '', target.pathname + target.search + target.hash);
    setLocation(readLocation());
    if (target.hash) {
      requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(target.hash.slice(1)))?.scrollIntoView({ block: 'start' });
      });
    } else if (!samePage || !options.replace) {
      window.scrollTo(0, 0);
      // Accessibilité : le focus passe au contenu principal de la nouvelle page.
      requestAnimationFrame(() => document.getElementById('contenu')?.focus({ preventScroll: true }));
    }
  }, []);

  const value = useMemo(() => ({ ...location, navigate }), [location, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter doit être utilisé dans RouterProvider');
  return ctx;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const { navigate, path } = useRouter();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      rest.target === '_blank'
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };
  const isCurrent = normalizePath(to) === path && !to.includes('#');
  return (
    <a href={to} onClick={handleClick} aria-current={isCurrent ? 'page' : undefined} {...rest}>
      {children}
    </a>
  );
}
