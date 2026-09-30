import { describe, expect, it } from 'vitest';
import { catalogFileName, isValidEmail, slugify, socialLabel, socialUrl, whatsappDigits, whatsappLink } from '../../src/core/text';

describe('nom de fichier', () => {
  it('suit le format catalogue-nom-de-la-boutique-date.pdf', () => {
    expect(catalogFileName('Épicerie Saveurs d’Afrique', new Date(2026, 8, 30))).toBe(
      'catalogue-epicerie-saveurs-d-afrique-2026-09-30.pdf',
    );
  });
  it('utilise un nom par défaut si la boutique est vide ou sans lettres', () => {
    expect(catalogFileName('', new Date(2026, 0, 5))).toBe('catalogue-ma-boutique-2026-01-05.pdf');
    expect(catalogFileName('🔥🔥', new Date(2026, 0, 5))).toBe('catalogue-ma-boutique-2026-01-05.pdf');
  });
  it('limite la longueur et nettoie les caractères spéciaux', () => {
    const slug = slugify('Boutique   de  Mode *** Très   Très Très Très Très Longue Kinshasa Gombe 2026');
    expect(slug.length).toBeLessThanOrEqual(50);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.endsWith('-')).toBe(false);
  });
  it('gère les ligatures', () => {
    expect(slugify('Œuvres & Cœur')).toBe('oeuvres-coeur');
  });
});

describe('WhatsApp', () => {
  it('accepte les numéros internationaux', () => {
    expect(whatsappDigits('+243 81 234 5678')).toBe('243812345678');
    expect(whatsappDigits('00225 07 00 00 00 00')).toBe('2250700000000');
  });
  it('refuse les numéros locaux (sans indicatif)', () => {
    expect(whatsappDigits('081 234 5678')).toBeNull();
    expect(whatsappDigits('')).toBeNull();
    expect(whatsappDigits('+12')).toBeNull();
  });
  it('construit un lien wa.me avec message encodé', () => {
    expect(whatsappLink('+243 81 234 5678', 'Bonjour à vous')).toBe(
      'https://wa.me/243812345678?text=Bonjour%20%C3%A0%20vous',
    );
  });
});

describe('réseaux sociaux et e-mail', () => {
  it('normalise les liens', () => {
    expect(socialUrl('instagram', '@ma.boutique')).toBe('https://instagram.com/ma.boutique');
    expect(socialUrl('facebook', 'facebook.com/maboutique')).toBe('https://facebook.com/maboutique');
    expect(socialUrl('facebook', 'https://www.facebook.com/x')).toBe('https://www.facebook.com/x');
    expect(socialUrl('instagram', 'nom avec espaces')).toBeNull();
    expect(socialLabel('https://instagram.com/ma.boutique')).toBe('@ma.boutique');
  });
  it('valide les e-mails', () => {
    expect(isValidEmail('nom@gmail.com')).toBe(true);
    expect(isValidEmail('nom@gmail')).toBe(false);
  });
});
