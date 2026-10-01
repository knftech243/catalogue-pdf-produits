// Questions fréquentes (page d'accueil, page FAQ et données structurées pour les moteurs de recherche).

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'gratuit',
    question: 'Catalogue Express est-il gratuit ?',
    answer:
      'Oui. Vous pouvez créer votre catalogue, voir l’aperçu et télécharger un PDF de démonstration gratuitement, sans inscription. Le PDF gratuit porte une mention discrète « version démo ». Une offre Premium sans filigrane est en préparation : elle n’est pas encore disponible et aucun paiement n’est demandé aujourd’hui.',
  },
  {
    id: 'compte',
    question: 'Dois-je créer un compte ?',
    answer:
      'Non. Il n’y a ni compte, ni mot de passe, ni inscription. Vous ouvrez la page, vous créez votre catalogue et vous le téléchargez.',
  },
  {
    id: 'photos',
    question: 'Mes photos sont-elles envoyées sur Internet ?',
    answer:
      'Non. Vos photos et les informations de vos produits restent sur votre appareil pendant la création de votre catalogue. Les photos sont redimensionnées et le PDF est fabriqué directement dans votre navigateur.',
  },
  {
    id: 'telephone',
    question: 'Est-ce que ça marche sur un téléphone Android ?',
    answer:
      'Oui, l’outil a été pensé d’abord pour les téléphones Android, avec de grands boutons et des étapes simples. Il fonctionne aussi sur iPhone, tablette et ordinateur, avec un navigateur récent (Chrome, Edge, Firefox, Safari).',
  },
  {
    id: 'whatsapp',
    question: 'Comment envoyer mon catalogue sur WhatsApp ?',
    answer:
      'Après le téléchargement, ouvrez WhatsApp, choisissez la discussion, appuyez sur le trombone puis « Document » et sélectionnez le fichier PDF dans vos téléchargements. Sur de nombreux téléphones, le bouton « Partager le PDF » ouvre directement la liste des applications, dont WhatsApp.',
  },
  {
    id: 'combien',
    question: 'Combien de produits puis-je ajouter ?',
    answer:
      'L’export gratuit peut contenir jusqu’à 50 produits. L’éditeur a été testé avec 50 produits sur téléphone. Pour de très gros catalogues, préférez un téléphone récent ou un ordinateur.',
  },
  {
    id: 'devise',
    question: 'Puis-je afficher mes prix en francs congolais ou en FCFA ?',
    answer:
      'Oui. Vous pouvez choisir le dollar américain (USD), le franc congolais (CDF), l’euro (EUR), le franc CFA (FCFA) ou saisir votre propre symbole de devise.',
  },
  {
    id: 'modifier',
    question: 'Puis-je modifier mon catalogue quand mes prix changent ?',
    answer:
      'Oui. Si la sauvegarde sur l’appareil est activée, vous retrouvez votre travail en revenant sur le site avec le même navigateur. Modifiez les prix puis téléchargez un nouveau PDF.',
  },
  {
    id: 'sans-photo',
    question: 'Que se passe-t-il si un produit n’a pas de photo ?',
    answer:
      'Le produit apparaît quand même dans le catalogue avec un emplacement « Photo à venir ». Une photo est recommandée, mais pas obligatoire.',
  },
  {
    id: 'formats',
    question: 'Quels formats de photos sont acceptés ?',
    answer:
      'Les photos JPEG, PNG, WebP et GIF, jusqu’à 25 Mo chacune. Les photos très lourdes sont automatiquement réduites pour garder un PDF léger. Le format HEIC de certains iPhone n’est pas pris en charge par tous les navigateurs : dans ce cas, envoyez la photo en JPEG.',
  },
  {
    id: 'modeles',
    question: 'Quels modèles de catalogue sont disponibles ?',
    answer:
      'Quatre modèles : Minimal clair, Mode élégante, Cosmétiques moderne et Épicerie et restauration colorée. Chacun existe en A4 portrait et A4 paysage, avec la couleur de votre choix.',
  },
  {
    id: 'imprimer',
    question: 'Puis-je imprimer mon catalogue ?',
    answer:
      'Oui, le PDF est au format A4 standard. Le texte est net à l’impression. Pour une impression de grande qualité, utilisez des photos nettes et bien éclairées.',
  },
  {
    id: 'liens',
    question: 'Mes clients peuvent-ils me contacter depuis le PDF ?',
    answer:
      'Oui, si vous indiquez un numéro WhatsApp au format international (par exemple +243…), le PDF contient des liens cliquables : vos clients peuvent vous écrire directement à propos d’un produit précis.',
  },
  {
    id: 'effacer',
    question: 'Comment effacer mes données ?',
    answer:
      'Dans l’outil de création, ouvrez « Données sur cet appareil » puis « Effacer mes données locales ». Vous pouvez aussi désactiver la sauvegarde automatique à tout moment.',
  },
  {
    id: 'premium',
    question: 'Quand l’offre Premium sera-t-elle disponible ?',
    answer:
      'Elle est en préparation. Son tarif et sa date de lancement seront annoncés sur la page Tarifs. D’ici là, aucun paiement n’est possible ni demandé.',
  },
];
