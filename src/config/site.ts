// Configuration publique du site. Aucune donnée secrète ici : tout est visible dans le navigateur.

const env = import.meta.env;

function clean(value: string | undefined): string {
  return (value ?? '').trim();
}

export const SITE = {
  name: 'Catalogue Express',
  /** URL publique sans barre oblique finale (sitemap, URL canoniques, Open Graph). */
  url: clean(env.VITE_SITE_URL).replace(/\/+$/, '') || 'https://www.example.com',
  locale: 'fr_FR',
  contactEmail: clean(env.VITE_CONTACT_EMAIL),
  social: {
    facebook: clean(env.VITE_SOCIAL_FACEBOOK),
    instagram: clean(env.VITE_SOCIAL_INSTAGRAM),
    tiktok: clean(env.VITE_SOCIAL_TIKTOK),
    whatsapp: clean(env.VITE_SOCIAL_WHATSAPP),
  },
  /** Lien vers la future page de paiement externe. Vide en V1 : aucun paiement actif. */
  premiumCheckoutUrl: clean(env.VITE_PREMIUM_CHECKOUT_URL),
} as const;

export const PRIVACY_NOTICE =
  'Vos photos et les informations de vos produits restent sur votre appareil pendant la création de votre catalogue.';

export const LEGAL_DRAFT_NOTICE =
  'Ce document est un modèle informatif à relire et adapter selon votre pays, votre activité et votre solution de paiement avant publication officielle.';
