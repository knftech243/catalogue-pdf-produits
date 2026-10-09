// En-têtes HTTP du site publié : source unique. Le pré-rendu (scripts/prerender.mjs) les convertit
// en fichier dist/_headers, lu par Netlify. Ce module n'est utilisé qu'au build : il n'est jamais
// envoyé aux navigateurs.
//
// Règle : un même nom d'en-tête n'est déclaré que dans UNE règle pour un fichier donné, afin
// d'éviter les valeurs combinées ambiguës (sécurité sur « /* », cache sur des chemins précis).

import { NOINDEX, SITE } from './site';

export interface HeaderRule {
  /** Chemin au format Netlify (« /* » = tous les fichiers). */
  path: string;
  headers: Record<string, string>;
}

/**
 * Politique de sécurité du contenu : uniquement les ressources du site.
 * - images data: et blob: : photos optimisées dans le navigateur et illustrations des exemples ;
 * - styles en ligne : attributs style générés par l'interface (couleurs, barres de progression) ;
 * - aucun script externe, aucun eval, aucun cadre, aucun plugin.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const ONE_YEAR = 31_536_000;
const ONE_DAY = 86_400;

/** Fichiers publics sans empreinte dans leur nom : cache court pour voir les mises à jour. */
const SHORT_CACHE_PATHS = [
  '/apercus/*',
  '/og-image.png',
  '/favicon.svg',
  '/favicon-32.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest',
];

export function headerRules(allowIndexing: boolean = SITE.allowIndexing): HeaderRule[] {
  const global: Record<string, string> = {
    'Content-Security-Policy': CONTENT_SECURITY_POLICY,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
  if (!allowIndexing) global['X-Robots-Tag'] = NOINDEX;
  return [
    { path: '/*', headers: global },
    // Fichiers produits par Vite : nom avec empreinte, donc immuables.
    { path: '/assets/*', headers: { 'Cache-Control': `public, max-age=${ONE_YEAR}, immutable` } },
    ...SHORT_CACHE_PATHS.map((path) => ({
      path,
      headers: { 'Cache-Control': `public, max-age=${ONE_DAY}` },
    })),
    // Pages HTML, robots.txt et sitemap : aucune règle, la valeur par défaut de Netlify
    // (revalidation à chaque visite) rend chaque mise à jour visible immédiatement.
  ];
}

/** Contenu du fichier _headers au format Netlify. */
export function toNetlifyHeaders(rules: HeaderRule[]): string {
  const blocks = rules.map(
    (rule) =>
      `${rule.path}\n${Object.entries(rule.headers)
        .map(([name, value]) => `  ${name}: ${value}`)
        .join('\n')}`,
  );
  // Commentaire en ASCII uniquement : aucun risque d'encodage dans le fichier lu par Netlify.
  return `# Generated at build time by scripts/prerender.mjs from src/config/headers.ts - do not edit.\n${blocks.join('\n\n')}\n`;
}
