// Balises <head> propres à chaque page : titre, description, URL canonique, Open Graph.
// Utilisées au pré-rendu (HTML statique) et lors de la navigation côté navigateur.

import { NOINDEX, SITE } from '../config/site';
import { FAQ_ITEMS } from '../content/faq';
import type { RouteDef } from '../routes';

/**
 * Valeur de la balise robots d'une page, ou null si la page est indexable.
 * - Indexation non autorisée (préproduction, valeur par défaut) : toutes les pages en noindex.
 * - Indexation autorisée : seule une page marquée noindex (404) l'est.
 */
export function robotsContent(route: RouteDef, allowIndexing: boolean = SITE.allowIndexing) {
  if (!allowIndexing) return NOINDEX;
  return route.noindex ? 'noindex, follow' : null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function canonicalUrl(route: RouteDef): string {
  return route.path === '/' ? `${SITE.url}/` : `${SITE.url}${route.path}`;
}

function jsonLd(route: RouteDef): object[] {
  const blocks: object[] = [];
  if (route.path === '/') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE.name,
      url: `${SITE.url}/`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Tous (navigateur web)',
      inLanguage: 'fr',
      description: route.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Aperçu et export de démonstration gratuits',
      },
    });
  }
  if (route.path === '/faq') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    });
  }
  return blocks;
}

/** HTML des balises <head> pour le pré-rendu. */
export function renderHeadTags(route: RouteDef): string {
  const url = canonicalUrl(route);
  const image = `${SITE.url}/og-image.png`;
  const robots = robotsContent(route);
  const tags = [
    `<title>${escapeHtml(route.title)}</title>`,
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
    ...(robots ? [`<meta name="robots" content="${robots}" />`] : []),
    ...(route.noindex ? [] : [`<link rel="canonical" href="${url}" />`]),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:locale" content="${SITE.locale}" />`,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Aperçu d’un catalogue PDF créé avec Catalogue Express" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  for (const block of jsonLd(route)) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`,
    );
  }
  return tags.join('\n    ');
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Met à jour le <head> lors d'une navigation dans le navigateur. */
export function applyHead(route: RouteDef): void {
  document.title = route.title;
  setMeta('meta[name="description"]', 'name', 'description', route.description);
  setMeta('meta[property="og:title"]', 'property', 'og:title', route.title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', route.description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl(route));
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  const robotsValue = robotsContent(route);
  if (robotsValue) {
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = robotsValue;
  } else {
    robots?.remove();
  }
  if (route.noindex) {
    canonical?.remove();
  } else {
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl(route);
  }
}
