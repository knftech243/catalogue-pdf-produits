// Configuration publique du site. Aucune donnée secrète ici : tout est visible dans le navigateur.

const env = import.meta.env;

function clean(value: string | undefined): string {
  return (value ?? '').trim();
}

export const SITE = {
  name: 'Catalogue Express',
  /**
   * URL publique sans barre oblique finale (sitemap, URL canoniques, Open Graph).
   * Vide si VITE_SITE_URL n'est pas définie : simple avertissement en local, échec du build sur
   * Netlify (scripts/prerender.mjs). Aucune adresse d'exemple n'est inscrite dans le code.
   */
  url: clean(env.VITE_SITE_URL).replace(/\/+$/, ''),
  /**
   * Indexation par les moteurs de recherche, autorisée UNIQUEMENT si VITE_ALLOW_INDEXING vaut
   * exactement « true » (future production publique). Par défaut : noindex (préproduction).
   */
  allowIndexing: clean(env.VITE_ALLOW_INDEXING) === 'true',
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

/** Valeur de la balise robots et de l'en-tête X-Robots-Tag tant que l'indexation n'est pas autorisée. */
export const NOINDEX = 'noindex, nofollow';

export const PRIVACY_NOTICE =
  'Vos photos et les informations de vos produits restent sur votre appareil pendant la création de votre catalogue.';

export const LEGAL_DRAFT_NOTICE =
  'Ce document est un modèle informatif à relire et adapter selon votre pays, votre activité et votre solution de paiement avant publication officielle.';
