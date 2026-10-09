// Configuration de déploiement : indexation (noindex par défaut), en-têtes HTTP, URL du site.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { NOT_FOUND_ROUTE, ROUTES } from '../../src/routes';

const HOME = ROUTES.find((r) => r.path === '/')!;
const FAQ = ROUTES.find((r) => r.path === '/faq')!;
const TEST_URL = 'https://preprod-test.netlify.app';

/** Recharge la configuration avec des variables d'environnement simulées. */
async function load(env: Record<string, string> = {}) {
  vi.resetModules();
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  const site = await import('../../src/config/site');
  const head = await import('../../src/seo/head');
  const headers = await import('../../src/config/headers');
  return { ...site, ...head, ...headers };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('indexation : noindex par défaut', () => {
  it.each([
    ['absente', undefined],
    ['vide', ''],
    ['« false »', 'false'],
    ['« TRUE »', 'TRUE'],
    ['« 1 »', '1'],
    ['« yes »', 'yes'],
  ])('VITE_ALLOW_INDEXING %s : noindex partout', async (_label, value) => {
    const m = await load(value === undefined ? {} : { VITE_ALLOW_INDEXING: value });
    expect(m.SITE.allowIndexing).toBe(false);
    for (const route of [...ROUTES, NOT_FOUND_ROUTE]) {
      expect(m.renderHeadTags(route)).toContain(
        '<meta name="robots" content="noindex, nofollow" />',
      );
    }
    const global = m.headerRules().find((r) => r.path === '/*')!;
    expect(global.headers['X-Robots-Tag']).toBe('noindex, nofollow');
    expect(m.toNetlifyHeaders(m.headerRules())).toContain('  X-Robots-Tag: noindex, nofollow');
  });

  it('VITE_ALLOW_INDEXING=true : noindex retiré, sauf sur la page 404', async () => {
    const m = await load({ VITE_ALLOW_INDEXING: 'true' });
    expect(m.SITE.allowIndexing).toBe(true);
    for (const route of ROUTES) {
      expect(m.renderHeadTags(route)).not.toContain('name="robots"');
    }
    expect(m.renderHeadTags(NOT_FOUND_ROUTE)).toContain(
      '<meta name="robots" content="noindex, follow" />',
    );
    expect(m.headerRules().some((r) => 'X-Robots-Tag' in r.headers)).toBe(false);
    expect(m.toNetlifyHeaders(m.headerRules())).not.toContain('X-Robots-Tag');
  });

  it('robotsContent : règles explicites', async () => {
    const m = await load();
    expect(m.robotsContent(HOME, false)).toBe('noindex, nofollow');
    expect(m.robotsContent(NOT_FOUND_ROUTE, false)).toBe('noindex, nofollow');
    expect(m.robotsContent(HOME, true)).toBeNull();
    expect(m.robotsContent(NOT_FOUND_ROUTE, true)).toBe('noindex, follow');
  });
});

describe('URL du site : canonique et Open Graph', () => {
  it('reprennent VITE_SITE_URL (barre finale retirée), sans example.com', async () => {
    const m = await load({ VITE_SITE_URL: `${TEST_URL}/` });
    expect(m.SITE.url).toBe(TEST_URL);
    const faq = m.renderHeadTags(FAQ);
    expect(faq).toContain(`<link rel="canonical" href="${TEST_URL}/faq" />`);
    expect(faq).toContain(`<meta property="og:url" content="${TEST_URL}/faq" />`);
    expect(faq).toContain(`<meta property="og:image" content="${TEST_URL}/og-image.png" />`);
    expect(m.renderHeadTags(HOME)).toContain(`<link rel="canonical" href="${TEST_URL}/" />`);
    for (const route of [...ROUTES, NOT_FOUND_ROUTE]) {
      expect(m.renderHeadTags(route)).not.toMatch(/example\.com/);
    }
  });

  it('la préproduction garde ses URL canoniques ; la 404 n’en a pas', async () => {
    const m = await load({ VITE_SITE_URL: TEST_URL });
    expect(m.renderHeadTags(FAQ)).toContain('rel="canonical"');
    expect(m.renderHeadTags(NOT_FOUND_ROUTE)).not.toContain('rel="canonical"');
  });
});

describe('en-têtes HTTP', () => {
  it('sécurité : CSP stricte et en-têtes attendus sur toutes les réponses', async () => {
    const m = await load();
    const global = m.headerRules().find((r) => r.path === '/*')!.headers;
    const csp = global['Content-Security-Policy'];
    for (const directive of [
      "default-src 'self'",
      "script-src 'self'",
      "img-src 'self' data: blob:",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
    ]) {
      expect(csp).toContain(directive);
    }
    expect(csp).not.toContain('unsafe-eval');
    expect(global['X-Content-Type-Options']).toBe('nosniff');
    expect(global['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(global['Permissions-Policy']).toContain('camera=()');
    expect(global['Strict-Transport-Security']).toContain('max-age=31536000');
  });

  it('cache : assets immuables, fichiers publics 1 jour, pages HTML sans règle', async () => {
    const m = await load();
    const rules = m.headerRules();
    expect(rules.find((r) => r.path === '/assets/*')!.headers['Cache-Control']).toBe(
      'public, max-age=31536000, immutable',
    );
    for (const path of ['/apercus/*', '/og-image.png', '/favicon.svg', '/manifest.webmanifest']) {
      expect(rules.find((r) => r.path === path)!.headers['Cache-Control']).toBe(
        'public, max-age=86400',
      );
    }
    expect(rules.some((r) => r.path.endsWith('.html') || r.path === '/')).toBe(false);
  });

  it('aucun doublon : le même en-tête n’est jamais déclaré dans « /* » et dans une autre règle', async () => {
    const m = await load();
    const rules = m.headerRules();
    const globalNames = new Set(Object.keys(rules.find((r) => r.path === '/*')!.headers));
    for (const rule of rules.filter((r) => r.path !== '/*')) {
      for (const name of Object.keys(rule.headers)) expect(globalNames.has(name)).toBe(false);
    }
    expect(new Set(rules.map((r) => r.path)).size).toBe(rules.length);
  });

  it('format Netlify : chemin puis en-têtes indentés', async () => {
    const m = await load();
    const text = m.toNetlifyHeaders(m.headerRules());
    expect(text).toMatch(/^# Generated at build time/);
    // Fichier lu par Netlify : uniquement des caractères ASCII.
    expect([...text].every((c) => c.charCodeAt(0) < 128)).toBe(true);
    expect(text).toContain('/*\n  Content-Security-Policy: ');
    expect(text).toContain('/assets/*\n  Cache-Control: public, max-age=31536000, immutable');
  });
});
