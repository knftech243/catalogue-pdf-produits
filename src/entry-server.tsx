// Point d'entrée du pré-rendu (build) : produit le HTML statique de chaque page pour le SEO.

import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';
import { findRoute, NOT_FOUND_ROUTE, ROUTES } from './routes';
import { renderHeadTags } from './seo/head';
import { SITE } from './config/site';

export function render(path: string): { html: string; head: string } {
  const route = findRoute(path) ?? NOT_FOUND_ROUTE;
  const html = renderToString(
    <StrictMode>
      <App url={path} />
    </StrictMode>,
  );
  return { html, head: renderHeadTags(route) };
}

export const routes = ROUTES;
export const siteUrl = SITE.url;
