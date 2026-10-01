import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('root')!;
const url = window.location.pathname + window.location.search + window.location.hash;
const app = (
  <StrictMode>
    <App url={url} />
  </StrictMode>
);

// Les pages pré-rendues au build sont « hydratées » ; en développement, rendu classique.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
