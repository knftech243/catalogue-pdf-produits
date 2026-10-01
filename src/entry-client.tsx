import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { findRoute, normalizePath } from './routes';

const container = document.getElementById('root')!;
const url = window.location.pathname + window.location.search + window.location.hash;
const app = (
  <StrictMode>
    <App url={url} />
  </StrictMode>
);

// Le HTML pré-rendu n'est « hydraté » que s'il correspond à l'adresse demandée. Si l'hébergeur a servi
// une autre page (redirection générique vers index.html, par exemple), on reconstruit la page.
const prerendered = container.dataset.route;
const path = normalizePath(window.location.pathname);
const matches =
  prerendered !== undefined && (prerendered === path || (prerendered === '/404' && !findRoute(path)));

if (container.firstElementChild && matches) {
  hydrateRoot(container, app);
} else {
  container.textContent = '';
  createRoot(container).render(app);
}
