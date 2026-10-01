// Offres et droits d'utilisation.
//
// V1 : TOUT LE MONDE EST EN OFFRE GRATUITE. Aucun paiement n'est connecté, aucune licence n'est
// vérifiée. Ce fichier prépare seulement l'architecture : quand un paiement sera branché
// (voir docs/PAYMENT_INTEGRATION_GUIDE.md), il suffira que `getCurrentPlan()` retourne 'premium'
// après une vérification fiable côté serveur ou prestataire.

import { SITE } from './site';

export type PlanId = 'free' | 'premium';

export interface Entitlements {
  /** Filigrane « version de démonstration » sur chaque page. */
  watermark: boolean;
  /** Nombre maximal de produits dans un export. */
  maxProductsPerExport: number;
  /** Résolution des photos dans le PDF (points par pouce). */
  imageDpi: number;
  /** Modèles utilisables. */
  templates: 'all';
  logo: boolean;
  customColors: boolean;
  socialLinks: boolean;
}

export const PLANS: Record<PlanId, { label: string; available: boolean; entitlements: Entitlements }> = {
  free: {
    label: 'Gratuit',
    available: true,
    entitlements: {
      watermark: true,
      maxProductsPerExport: 50,
      imageDpi: 150,
      templates: 'all',
      logo: true,
      customColors: true,
      socialLinks: true,
    },
  },
  premium: {
    label: 'Premium',
    // Passera à true uniquement quand un vrai paiement sera connecté.
    available: false,
    entitlements: {
      watermark: false,
      maxProductsPerExport: 200,
      imageDpi: 220,
      templates: 'all',
      logo: true,
      customColors: true,
      socialLinks: true,
    },
  },
};

/** Offre active de l'utilisateur. En V1, toujours « free ». */
export function getCurrentPlan(): PlanId {
  return 'free';
}

export function getEntitlements(plan: PlanId = getCurrentPlan()): Entitlements {
  return PLANS[plan].entitlements;
}

export function isPremiumCheckoutAvailable(): boolean {
  return PLANS.premium.available && SITE.premiumCheckoutUrl.length > 0;
}

export const WATERMARK_TEXT = 'VERSION DÉMO · CATALOGUE EXPRESS';

/** Fonctionnalités prévues pour l'offre Premium (non actives en V1). */
export const PREMIUM_FEATURES = [
  'Export sans filigrane',
  'Nombre de produits étendu (jusqu’à 200 par catalogue)',
  'Tous les modèles, y compris les futurs modèles',
  'Photos en meilleure résolution',
  'Page de couverture personnalisée',
  'Plusieurs catalogues enregistrés et duplication',
  'Sauvegarde et reprise sur un autre appareil (future version)',
];
