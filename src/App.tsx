import { lazy, Suspense, useEffect, useSyncExternalStore, type ComponentType } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ContactPage } from './pages/ContactPage';
import { ExamplesPage } from './pages/ExamplesPage';
import { FaqPage } from './pages/FaqPage';
import { HomePage } from './pages/HomePage';
import { LegalNoticePage, PrivacyPage, RefundPage, TermsPage } from './pages/LegalPages';
import { NotFoundPage } from './pages/NotFoundPage';
import { PricingPage } from './pages/PricingPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { findRoute, NOT_FOUND_ROUTE } from './routes';
import { RouterProvider, useRouter } from './router/router';
import { applyHead } from './seo/head';
import './styles/base.css';
import './styles/site.css';

// L'outil de création est chargé à la demande : la page d'accueil reste légère.
const CreatorPage = lazy(() => import('./creator/CreatorPage'));

function CreatorFallback() {
  return (
    <div className="container creator-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>Chargement de l’outil de création…</span>
    </div>
  );
}

const noop = () => () => {};

/**
 * Faux pendant le pré-rendu et la toute première hydratation, vrai ensuite.
 * L'outil (chargé à la demande) n'est jamais rendu côté serveur : le HTML pré-rendu de /creer
 * contient l'écran de chargement, identique au premier rendu du navigateur (pas d'erreur d'hydratation).
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

const PAGES: Record<string, ComponentType> = {
  '/': HomePage,
  '/modeles': TemplatesPage,
  '/exemples': ExamplesPage,
  '/tarifs': PricingPage,
  '/faq': FaqPage,
  '/contact': ContactPage,
  '/confidentialite': PrivacyPage,
  '/conditions-utilisation': TermsPage,
  '/remboursement': RefundPage,
  '/mentions-legales': LegalNoticePage,
};

function Routes() {
  const { path } = useRouter();
  const route = findRoute(path) ?? NOT_FOUND_ROUTE;
  const hydrated = useHydrated();

  useEffect(() => {
    applyHead(route);
  }, [route]);

  let content;
  if (path === '/creer') {
    content = hydrated ? (
      <Suspense fallback={<CreatorFallback />}>
        <CreatorPage />
      </Suspense>
    ) : (
      <CreatorFallback />
    );
  } else {
    const Page = PAGES[path] ?? NotFoundPage;
    content = <Page />;
  }

  return (
    <>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1} className={path === '/creer' ? 'main main-creator' : 'main'}>
        {content}
      </main>
      <Footer />
    </>
  );
}

/** ErrorBoundary globale, réinitialisée à chaque changement de page. */
function SafeRoutes() {
  const { path } = useRouter();
  return (
    <ErrorBoundary resetKey={path}>
      <Routes />
    </ErrorBoundary>
  );
}

export function App({ url }: { url: string }) {
  return (
    <RouterProvider url={url}>
      <SafeRoutes />
    </RouterProvider>
  );
}
