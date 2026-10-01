// Liste des pages : utilisée par le routeur, le pré-rendu (SEO) et le sitemap.

export interface RouteDef {
  path: string;
  /** Balise <title>. */
  title: string;
  description: string;
  /** Libellé court (fil d'Ariane, menus). */
  label: string;
  noindex?: boolean;
  priority?: number;
}

export const ROUTES: RouteDef[] = [
  {
    path: '/',
    label: 'Accueil',
    title: 'Catalogue Express — Créez votre catalogue PDF produits en quelques minutes',
    description:
      'Transformez vos photos produits en catalogue PDF professionnel, prêt à partager sur WhatsApp, Facebook ou par e-mail. Gratuit, simple, sans inscription, vos photos restent sur votre téléphone.',
    priority: 1,
  },
  {
    path: '/creer',
    label: 'Créer mon catalogue',
    title: 'Créer mon catalogue PDF gratuitement — Catalogue Express',
    description:
      'Ajoutez vos photos, vos prix et vos coordonnées, choisissez un modèle et téléchargez votre catalogue PDF. Fonctionne sur téléphone Android, sans compte.',
    priority: 0.9,
  },
  {
    path: '/modeles',
    label: 'Modèles',
    title:
      'Modèles de catalogues PDF : mode, cosmétiques, restaurant, épicerie — Catalogue Express',
    description:
      'Quatre modèles de catalogues PDF prêts à l’emploi : Minimal clair, Mode élégante, Cosmétiques moderne et Épicerie et restauration colorée.',
    priority: 0.8,
  },
  {
    path: '/exemples',
    label: 'Exemples',
    title: 'Exemples de catalogues PDF produits — Catalogue Express',
    description:
      'Découvrez des exemples de catalogues PDF créés avec Catalogue Express : boutique de vêtements, cosmétiques, menu de restaurant et liste de prix d’épicerie.',
    priority: 0.8,
  },
  {
    path: '/tarifs',
    label: 'Tarifs',
    title: 'Tarifs — Catalogue Express gratuit et future offre Premium',
    description:
      'Catalogue Express est gratuit : aperçu et export de démonstration. Une offre Premium sans filigrane est en préparation, son tarif sera annoncé au lancement.',
    priority: 0.6,
  },
  {
    path: '/faq',
    label: 'FAQ',
    title: 'Questions fréquentes — Catalogue Express',
    description:
      'Toutes les réponses sur la création de catalogue PDF : photos, prix, devises, partage sur WhatsApp, confidentialité, offre gratuite et Premium.',
    priority: 0.7,
  },
  {
    path: '/contact',
    label: 'Contact',
    title: 'Contact — Catalogue Express',
    description: 'Une question, une idée ou un problème ? Contactez l’équipe de Catalogue Express.',
    priority: 0.4,
  },
  {
    path: '/confidentialite',
    label: 'Politique de confidentialité',
    title: 'Politique de confidentialité — Catalogue Express',
    description:
      'Comment Catalogue Express traite vos données : photos traitées localement dans le navigateur, stockage local effaçable, aucun compte.',
    priority: 0.3,
  },
  {
    path: '/conditions-utilisation',
    label: 'Conditions d’utilisation',
    title: 'Conditions d’utilisation — Catalogue Express',
    description: 'Conditions d’utilisation du service Catalogue Express (modèle à adapter).',
    priority: 0.3,
  },
  {
    path: '/remboursement',
    label: 'Politique de remboursement',
    title: 'Politique de remboursement — Catalogue Express',
    description:
      'Politique de remboursement de la future offre Premium de Catalogue Express (modèle à adapter).',
    priority: 0.2,
  },
  {
    path: '/mentions-legales',
    label: 'Mentions légales',
    title: 'Mentions légales — Catalogue Express',
    description: 'Mentions légales du site Catalogue Express (modèle à compléter).',
    priority: 0.2,
  },
];

export const NOT_FOUND_ROUTE: RouteDef = {
  path: '/404',
  label: 'Page introuvable',
  title: 'Page introuvable — Catalogue Express',
  description: 'Cette page n’existe pas ou a été déplacée.',
  noindex: true,
};

export function normalizePath(path: string): string {
  const clean = path.split(/[?#]/)[0] || '/';
  if (clean.length > 1 && clean.endsWith('/')) return clean.replace(/\/+$/, '') || '/';
  return clean;
}

export function findRoute(path: string): RouteDef | undefined {
  const p = normalizePath(path);
  return ROUTES.find((r) => r.path === p);
}
