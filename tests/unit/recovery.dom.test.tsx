// @vitest-environment jsdom
// Comportement de secours dans le navigateur : ErrorBoundary et ouverture de l'outil avec une
// sauvegarde locale corrompue.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { createDefaultSettings } from '../../src/core/defaults';
import CreatorPage from '../../src/creator/CreatorPage';
import { CATALOG_BACKUP_KEY, CATALOG_KEY } from '../../src/creator/storage';
import { RouterProvider } from '../../src/router/router';
import { makeCatalog } from './helpers';

function Panne({ fail }: { fail: boolean }) {
  if (fail) throw new Error('panne simulée');
  return <p>Contenu normal</p>;
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('sans erreur : affiche les enfants tels quels', () => {
    const { container } = render(
      <ErrorBoundary resetKey="/">
        <Panne fail={false} />
      </ErrorBoundary>,
    );
    expect(container.innerHTML).toBe('<p>Contenu normal</p>');
  });

  it('erreur : écran de secours au lieu d’une page blanche', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary resetKey="/creer">
        <Panne fail />
      </ErrorBoundary>,
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Un problème est survenu');
    expect(alert.textContent).toContain('Aucune donnée n’a été envoyée sur Internet');
    expect(screen.getByRole('button', { name: 'Recharger la page' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Retour à l’accueil' }).getAttribute('href')).toBe('/');
    expect(consoleError.mock.calls.some((c) => String(c[0]).includes('[Catalogue Express]'))).toBe(
      true,
    );
  });

  it('changement de page : le contenu normal est réaffiché', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary resetKey="/creer">
        <Panne fail />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    rerender(
      <ErrorBoundary resetKey="/">
        <Panne fail={false} />
      </ErrorBoundary>,
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Contenu normal')).toBeTruthy();
  });
});

describe('outil de création — ouverture avec une sauvegarde abîmée', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  const openCreator = (url: string) =>
    render(
      <RouterProvider url={url}>
        <CreatorPage />
      </RouterProvider>,
    );

  it('sauvegarde illisible : l’outil s’ouvre vide, explique la situation et ne détruit rien', async () => {
    localStorage.setItem(CATALOG_KEY, '{"version":1,"products":[');
    openCreator('/creer');
    expect(
      await screen.findByText(/Votre sauvegarde précédente n’a pas pu être relue/),
    ).toBeTruthy();
    expect(
      screen.getByText(/une copie de l’ancienne sauvegarde est gardée sur cet appareil/),
    ).toBeTruthy();
    expect((document.getElementById('shop-name') as HTMLInputElement).value).toBe('');
    expect(localStorage.getItem(CATALOG_BACKUP_KEY)).toBe('{"version":1,"products":[');
    // Sans modification de l'utilisateur, l'ancienne sauvegarde n'est pas écrasée.
    await new Promise((r) => setTimeout(r, 500));
    expect(localStorage.getItem(CATALOG_KEY)).toBe('{"version":1,"products":[');
    fireEvent.click(screen.getByRole('button', { name: 'J’ai compris' }));
    await vi.waitFor(() =>
      expect(screen.queryByText(/Votre sauvegarde précédente n’a pas pu être relue/)).toBeNull(),
    );
  });

  it('réglages corrompus : l’outil s’ouvre normalement, boutique et produits conservés', async () => {
    const saved = makeCatalog(4);
    localStorage.setItem(
      CATALOG_KEY,
      JSON.stringify({
        ...saved,
        settings: { ...saved.settings, density: 'enorme', templateId: 'inconnu', orientation: 9 },
      }),
    );
    // Étape « Modèle » : c'est elle qui calcule les mises en page avec les réglages.
    openCreator('/creer?etape=3');
    expect(await screen.findByRole('heading', { name: 'Choisissez un modèle' })).toBeTruthy();
    expect(screen.queryByText(/n’a pas pu être relue/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    const selected = screen
      .getAllByRole('radio')
      .find(
        (r) => r.getAttribute('aria-checked') === 'true' && r.className.includes('template-choice'),
      );
    expect(selected?.textContent).toContain('Minimal clair');
    // Densité par défaut (« Moyens ») sélectionnée à la place de la valeur corrompue.
    expect(createDefaultSettings().density).toBe('medium');
    expect((screen.getByRole('radio', { name: /Moyens/ }) as HTMLInputElement).checked).toBe(true);
    expect(localStorage.getItem(CATALOG_BACKUP_KEY)).toBeNull();
  });
});
