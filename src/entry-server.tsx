// Point d'entrée du pré-rendu (build) : produit le HTML statique de chaque page pour le SEO.

import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';
import { headerRules, toNetlifyHeaders } from './config/headers';
import { NOINDEX, SITE } from './config/site';
import { findRoute, NOT_FOUND_ROUTE, ROUTES } from './routes';
import { renderHeadTags } from './seo/head';

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
export const allowIndexing = SITE.allowIndexing;
export const noindexValue = NOINDEX;
/** Contenu de dist/_headers (Netlify), calculé avec les mêmes réglages que les pages. */
export const netlifyHeaders = toNetlifyHeaders(headerRules(SITE.allowIndexing));
