// Boutiques de démonstration — données 100 % fictives.
// Numéros volontairement factices (+243 00…, +225 00…, +32 000…) et adresses e-mail en
// « example.com » (domaine réservé à la documentation) : aucun lien ne mène à une vraie personne.

import { createDefaultSettings, createEmptyShop } from '../core/defaults';
import type { Availability, CatalogSettings, ShopInfo, TemplateId } from '../core/types';
import type { IllustrationSpec } from './illustrations';

export type DemoId = 'vetements' | 'cosmetiques' | 'restaurant' | 'epicerie';

export interface DemoProduct {
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  category: string;
  reference?: string;
  availability?: Availability;
  art: IllustrationSpec;
}

export interface DemoShop {
  id: DemoId;
  label: string;
  sector: string;
  shop: ShopInfo;
  settings: CatalogSettings;
  products: DemoProduct[];
}

function settings(templateId: TemplateId, extra: Partial<CatalogSettings> = {}): CatalogSettings {
  return { ...createDefaultSettings(), templateId, ...extra };
}

const art = (kind: IllustrationSpec['kind'], main: string, accent: string, bg: string): IllustrationSpec => ({
  kind,
  main,
  accent,
  bg,
});

export const DEMO_SHOPS: DemoShop[] = [
  {
    id: 'vetements',
    label: 'Boutique de vêtements',
    sector: 'Mode',
    shop: {
      ...createEmptyShop(),
      name: 'Kiese Mode',
      slogan: 'Le style qui vous ressemble, à prix doux',
      owner: 'Grâce M.',
      whatsapp: '+243 00 000 0001',
      phone: '',
      email: 'kiese.mode@example.com',
      address: 'Kinshasa, Gombe',
      currency: { code: 'USD', customSymbol: '', customPosition: 'after' },
      primaryColor: '#9C6B3C',
    },
    settings: settings('fashion', { coverTitle: 'Nouvelle collection', density: 'medium' }),
    products: [
      { name: 'Robe wax longue', price: 35, description: 'Coupe évasée, tissu wax 100 % coton. Tailles S à XXL.', category: 'Robes', reference: 'RB-01', availability: 'in_stock', art: art('dress', '#E0662B', '#1F4E79', '#F6E6D8') },
      { name: 'T-shirt coton bio', price: 12, oldPrice: 15, description: 'Col rond, coton doux et respirant. Plusieurs couleurs.', category: 'Hauts', reference: 'TS-04', availability: 'in_stock', art: art('tshirt', '#2F5D8C', '#F2B134', '#E3ECF4') },
      { name: 'Baskets urbaines', price: 45, oldPrice: 55, description: 'Semelle confortable, idéales pour la ville. Pointures 38 à 45.', category: 'Chaussures', reference: 'BK-12', availability: 'limited', art: art('sneaker', '#1E1E1E', '#E24A3B', '#ECECEC') },
      { name: 'Sac à main en cuir', price: 38, description: 'Cuir véritable, fermeture aimantée, poche intérieure.', category: 'Accessoires', reference: 'SC-07', availability: 'in_stock', art: art('handbag', '#8A4B2A', '#D9A441', '#F3E7DC') },
      { name: 'Robe de soirée satinée', price: 49, description: 'Satin fluide, dos décolleté. Idéale pour les cérémonies.', category: 'Robes', reference: 'RB-09', availability: 'on_order', art: art('dress', '#7B2D5B', '#E8C872', '#F1E3EC') },
      { name: 'Chemise en lin', price: 22, description: 'Lin léger, parfait pour la chaleur. Manches longues.', category: 'Hauts', reference: 'CH-02', availability: 'in_stock', art: art('tshirt', '#EDE6D6', '#6C8E5E', '#E4EAE0') },
      { name: 'Casquette brodée', price: 10, description: 'Réglable, broderie ton sur ton.', category: 'Accessoires', reference: 'CP-03', availability: 'in_stock', art: art('cap', '#2E6B4F', '#F1E4C3', '#E1EEE7') },
      { name: 'Montre classique', price: 29.9, description: 'Bracelet cuir, cadran doré, résistante aux éclaboussures.', category: 'Accessoires', reference: 'MT-05', availability: 'limited', art: art('watch', '#5A3A22', '#D4A94F', '#F2ECE4') },
      { name: 'T-shirt imprimé wax', price: 14, description: 'Motif wax exclusif sur la poitrine. Unisexe.', category: 'Hauts', reference: 'TS-08', availability: 'in_stock', art: art('tshirt', '#C8412B', '#1E3F66', '#F6E3DE') },
      { name: 'Baskets en toile', price: 25, description: 'Légères et faciles à assortir. Pointures 36 à 44.', category: 'Chaussures', reference: 'BK-15', availability: 'in_stock', art: art('sneaker', '#F0EDE6', '#2F5D8C', '#E6E9EE') },
      { name: 'Pochette de soirée', price: 18, description: 'Petite pochette à chaîne dorée amovible.', category: 'Accessoires', reference: 'SC-11', availability: 'sold_out', art: art('handbag', '#1F1F1F', '#D4A94F', '#EAEAEA') },
      { name: 'Ensemble pagne enfant', price: 20, description: 'Haut + jupe assortis, de 2 à 10 ans.', category: 'Enfants', reference: 'EF-01', availability: 'on_order', art: art('dress', '#F2B134', '#2A7F62', '#FBF1DC') },
      { name: 'Casquette unie', price: 8, description: 'Coton épais, visière incurvée.', category: 'Accessoires', reference: 'CP-06', availability: 'in_stock', art: art('cap', '#1E3F66', '#E0662B', '#E3EAF2') },
    ],
  },
  {
    id: 'cosmetiques',
    label: 'Boutique de cosmétiques',
    sector: 'Beauté',
    shop: {
      ...createEmptyShop(),
      name: 'Éclat Naturel',
      slogan: 'Des soins naturels pour une peau qui rayonne',
      owner: 'Awa K.',
      whatsapp: '+225 00 00 00 00 02',
      phone: '',
      email: 'eclat.naturel@example.com',
      address: 'Abidjan, Cocody',
      currency: { code: 'FCFA', customSymbol: '', customPosition: 'after' },
      primaryColor: '#C8416F',
    },
    settings: settings('beauty', { coverTitle: 'Catalogue beauté', density: 'medium' }),
    products: [
      { name: 'Beurre de karité pur', price: 4000, oldPrice: 5000, description: 'Karité brut non raffiné. Nourrit la peau et les cheveux.', category: 'Corps', reference: 'KA-250', availability: 'in_stock', art: art('jar', '#6B4A2E', '#E9B949', '#F7EEDD') },
      { name: 'Rouge à lèvres mat', price: 3500, description: 'Tenue longue durée, texture confortable. 8 teintes.', category: 'Maquillage', reference: 'RL-01', availability: 'in_stock', art: art('lipstick', '#B3123A', '#2B2B2B', '#F6E1E6') },
      { name: 'Lait hydratant corps', price: 6500, description: 'Au beurre de cacao. Pénètre vite, ne colle pas. 400 ml.', category: 'Corps', reference: 'LH-400', availability: 'in_stock', art: art('pump', '#E7C9A9', '#8C5A3C', '#F5ECE3') },
      { name: 'Parfum « Nuit dorée » 50 ml', price: 15000, description: 'Notes de vanille, d\'ambre et de fleur d\'oranger.', category: 'Parfums', reference: 'PF-50', availability: 'limited', art: art('perfume', '#D9A441', '#3B2A20', '#F4ECDD') },
      { name: 'Sérum éclat vitamine C', price: 9000, description: 'Unifie le teint et estompe les taches. 30 ml.', category: 'Visage', reference: 'SE-30', availability: 'in_stock', art: art('dropper', '#E07A2E', '#F4D6B8', '#FBEBDD') },
      { name: 'Crème mains au karité', price: 2500, description: 'Répare les mains sèches. Format pratique 75 ml.', category: 'Corps', reference: 'CM-75', availability: 'in_stock', art: art('tube', '#F2D5DD', '#C8416F', '#FAEEF1') },
      { name: 'Huile de coco vierge', price: 3000, description: 'Pressée à froid. Cheveux, peau et massage.', category: 'Cheveux', reference: 'HC-100', availability: 'in_stock', art: art('dropper', '#EFE7D4', '#2E7D5B', '#EAF3EC') },
      { name: 'Gloss brillant', price: 3000, description: 'Effet repulpant et brillance miroir.', category: 'Maquillage', reference: 'GL-02', availability: 'limited', art: art('lipstick', '#E86A92', '#D9D9D9', '#FBE6EE') },
      { name: 'Masque à l\'argile', price: 5500, description: 'Purifie et resserre les pores. 1 à 2 fois par semaine.', category: 'Visage', reference: 'MA-150', availability: 'in_stock', art: art('jar', '#7C8C6E', '#C9D6B8', '#EEF1E8') },
      { name: 'Savon noir africain', price: 1500, description: 'Nettoie en douceur, convient aux peaux sensibles.', category: 'Corps', reference: 'SN-01', availability: 'in_stock', art: art('jar', '#3A3A3A', '#B08D57', '#ECE8E2') },
      { name: 'Eau de toilette fraîche', price: 12000, description: 'Agrumes et thé vert, légère et pétillante. 100 ml.', category: 'Parfums', reference: 'ET-100', availability: 'on_order', art: art('perfume', '#7FB8C9', '#1F4E5A', '#E6F2F5') },
      { name: 'Gel douche coco', price: 4500, description: 'Mousse douce au parfum gourmand. 500 ml.', category: 'Corps', reference: 'GD-500', availability: 'sold_out', art: art('pump', '#FFFFFF', '#2E9C8A', '#E4F2EF') },
      { name: 'Crème solaire SPF 50', price: 8000, description: 'Haute protection, sans traces blanches.', category: 'Visage', reference: 'CS-50', availability: 'in_stock', art: art('tube', '#F6C343', '#E07A2E', '#FDF3DC') },
    ],
  },
  {
    id: 'restaurant',
    label: 'Restaurant / fast-food',
    sector: 'Restauration',
    shop: {
      ...createEmptyShop(),
      name: 'Chez Maman Mado',
      slogan: 'La cuisine de chez nous, préparée chaque jour',
      owner: 'Madeleine T.',
      whatsapp: '+243 00 000 0003',
      phone: '+243 00 000 0004',
      email: 'maman.mado@example.com',
      address: 'Kinshasa, Limete — Livraison possible',
      currency: { code: 'CDF', customSymbol: '', customPosition: 'after' },
      primaryColor: '#D2452B',
    },
    settings: settings('food', { coverTitle: 'Menu', density: 'medium', groupByCategory: true }),
    products: [
      { name: 'Poulet braisé et frites', price: 25000, description: 'Demi-poulet mariné, braisé au feu de bois, frites maison.', category: 'Plats', availability: 'in_stock', art: art('plate', '#B5652A', '#4FA83D', '#F6EBDD') },
      { name: 'Liboke de poisson', price: 28000, description: 'Poisson cuit en feuilles de bananier, épices maison.', category: 'Plats', availability: 'limited', art: art('plate', '#8C6B3F', '#2E7D32', '#EFE9DC') },
      { name: 'Fumbwa et chikwangue', price: 20000, description: 'Feuilles de fumbwa à la pâte d\'arachide.', category: 'Plats', availability: 'in_stock', art: art('plate', '#3E6B2A', '#E3C27A', '#EDF1E4') },
      { name: 'Burger maison', price: 18000, description: 'Steak haché, cheddar, salade, tomate, sauce maison.', category: 'Burgers', availability: 'in_stock', art: art('burger', '#6B3A1E', '#F2C230', '#FBEBD8') },
      { name: 'Burger double cheese', price: 24000, oldPrice: 27000, description: 'Deux steaks, double cheddar, oignons caramélisés.', category: 'Burgers', availability: 'in_stock', art: art('burger', '#5A2F18', '#F5B82E', '#F8E4D0') },
      { name: 'Pizza margherita', price: 30000, description: 'Sauce tomate, mozzarella, basilic. 30 cm.', category: 'Pizzas', availability: 'in_stock', art: art('pizza', '#D9472B', '#4FA83D', '#FBE9DF') },
      { name: 'Pizza poulet piquant', price: 35000, description: 'Poulet mariné, piment doux, oignons rouges. 30 cm.', category: 'Pizzas', availability: 'on_order', art: art('pizza', '#C9362A', '#8E2A1E', '#F9E2DA') },
      { name: 'Brochettes de bœuf (5)', price: 15000, description: 'Bœuf mariné, poivrons, sauce pili-pili à part.', category: 'Grillades', availability: 'in_stock', art: art('skewer', '#7A3B1D', '#E24A3B', '#F7E6DA') },
      { name: 'Brochettes de poulet (5)', price: 12000, description: 'Poulet citronné, légumes grillés.', category: 'Grillades', availability: 'in_stock', art: art('skewer', '#C98A3E', '#F2B134', '#FBF0DF') },
      { name: 'Frites maison', price: 6000, description: 'Pommes de terre fraîches, coupées à la main.', category: 'Accompagnements', availability: 'in_stock', art: art('fries', '#D2452B', '#F4C542', '#FCEEDD') },
      { name: 'Jus de gingembre', price: 4000, description: 'Gingembre frais, citron, un peu de miel. 50 cl.', category: 'Boissons', availability: 'in_stock', art: art('drink', '#E8B84A', '#6CA544', '#FBF4DE') },
      { name: 'Bissap glacé', price: 3500, description: 'Fleurs d\'hibiscus infusées, servi très frais. 50 cl.', category: 'Boissons', availability: 'in_stock', art: art('drink', '#8E1B3A', '#E86A92', '#F8E3E9') },
      { name: 'Cocktail de fruits', price: 6000, description: 'Mangue, ananas et passion, sans sucre ajouté.', category: 'Boissons', availability: 'sold_out', art: art('drink', '#F28C28', '#F2C230', '#FDEFD9') },
    ],
  },
  {
    id: 'epicerie',
    label: 'Épicerie',
    sector: 'Alimentation',
    shop: {
      ...createEmptyShop(),
      name: "Épicerie Saveurs d'Afrique",
      slogan: 'Les produits du pays, près de chez vous',
      owner: 'Joseph N.',
      whatsapp: '+32 000 00 00 05',
      phone: '',
      email: 'saveurs.afrique@example.com',
      address: 'Bruxelles, quartier Matonge',
      currency: { code: 'EUR', customSymbol: '', customPosition: 'after' },
      primaryColor: '#1F8A4C',
    },
    settings: settings('minimal', { coverTitle: 'Liste de prix', density: 'medium' }),
    products: [
      { name: 'Riz parfumé 5 kg', price: 11.9, description: 'Riz long grain au parfum délicat.', category: 'Épicerie salée', reference: 'RZ-5', availability: 'in_stock', art: art('sack', '#E9DFC7', '#1F8A4C', '#EEF3EA') },
      { name: 'Huile de palme 1 L', price: 5.5, description: 'Huile rouge traditionnelle, idéale pour la moambe.', category: 'Huiles', reference: 'HP-1', availability: 'in_stock', art: art('oil', '#C8421E', '#1F8A4C', '#F7E6DF') },
      { name: 'Concentré de tomate', price: 1.2, description: 'Boîte de 400 g, double concentré.', category: 'Conserves', reference: 'CT-400', availability: 'in_stock', art: art('can', '#D23A2A', '#4FA83D', '#F7E4E1') },
      { name: 'Gari (semoule de manioc) 1 kg', price: 3.9, description: 'Gari blanc fin, à préparer en quelques minutes.', category: 'Épicerie salée', reference: 'GA-1', availability: 'in_stock', art: art('sack', '#F2EBDC', '#E0662B', '#F7EFE4') },
      { name: 'Farine de fufu 1 kg', price: 4.5, description: 'Farine de manioc pour un fufu lisse et ferme.', category: 'Épicerie salée', reference: 'FF-1', availability: 'limited', art: art('box', '#E8A33D', '#1F5E8C', '#FBF1DF') },
      { name: 'Lait en poudre 400 g', price: 6.9, oldPrice: 7.5, description: 'Lait entier en poudre, boîte refermable.', category: 'Petit-déjeuner', reference: 'LP-400', availability: 'in_stock', art: art('can', '#1F5E8C', '#F2C230', '#E3ECF4') },
      { name: "Sardines à l'huile", price: 2.2, description: 'Sardines entières, huile végétale. 125 g.', category: 'Conserves', reference: 'SD-125', availability: 'in_stock', art: art('can', '#2A7F9E', '#E8D18A', '#E2F0F4') },
      { name: 'Sucre en morceaux 1 kg', price: 1.8, description: 'Sucre blanc de canne en morceaux.', category: 'Petit-déjeuner', reference: 'SU-1', availability: 'in_stock', art: art('box', '#F4F4F4', '#1F8A4C', '#ECEFF1') },
      { name: "Huile d'arachide 1 L", price: 4.9, description: 'Pour les fritures et les sauces.', category: 'Huiles', reference: 'HA-1', availability: 'in_stock', art: art('oil', '#E8C24A', '#8C5A2B', '#FBF4DC') },
      { name: 'Bananes plantains (le kg)', price: 2.99, description: 'Plantains mûrs à point, arrivage chaque semaine.', category: 'Fruits et légumes', reference: 'PL-KG', availability: 'in_stock', art: art('fruits', '#E8C23A', '#2E7D32', '#F6F1DC') },
      { name: 'Lait concentré sucré', price: 1.6, description: 'Boîte de 397 g.', category: 'Petit-déjeuner', reference: 'LC-397', availability: 'sold_out', art: art('can', '#F4EBD0', '#1F5E8C', '#EEF1F4') },
      { name: 'Jus de bissap 1 L', price: 3.5, description: 'Prêt à boire, peu sucré.', category: 'Boissons', reference: 'JB-1', availability: 'in_stock', art: art('carton', '#8E1B3A', '#F2C230', '#F6E4E9') },
      { name: 'Piments frais (250 g)', price: 1.99, description: 'Piments rouges, très parfumés.', category: 'Fruits et légumes', reference: 'PI-250', availability: 'limited', art: art('fruits', '#D23A2A', '#2E7D32', '#F7E4E1') },
      { name: 'Café moulu 250 g', price: 4.2, description: 'Café arabica torréfié, mouture moyenne.', category: 'Petit-déjeuner', reference: 'CF-250', availability: 'on_order', art: art('box', '#5A3A22', '#D9A441', '#F1EBE4') },
    ],
  },
];

export function getDemoShop(id: DemoId): DemoShop {
  return DEMO_SHOPS.find((s) => s.id === id) ?? DEMO_SHOPS[0];
}

/** Données d'exemple pour le seul formulaire boutique (étape 1). */
export function sampleShopInfo(): ShopInfo {
  return {
    ...createEmptyShop(),
    name: 'Boutique Mwinda',
    slogan: 'Qualité et petits prix, livrés chez vous',
    owner: 'Patrick L.',
    whatsapp: '+243 00 000 0000',
    phone: '',
    email: 'boutique.mwinda@example.com',
    address: 'Lubumbashi, centre-ville',
    currency: { code: 'USD', customSymbol: '', customPosition: 'after' },
    primaryColor: '#2447D5',
  };
}
