# Audit d'accessibilité

Référentiel : WCAG 2.1 niveaux A et AA. Date : 1er octobre 2026.

## Méthode

1. **Audit automatisé axe-core 4.13** dans Microsoft Edge (`tests/e2e/a11y.spec.ts`) sur les 11 pages
   du site et sur l'outil (5 étapes + fenêtre d'ajout de produit), en ordinateur et en téléphone 375 px.
2. **ESLint jsx-a11y** sur tout le code (libellés, textes alternatifs, rôles, interactions).
3. **Tests Playwright fonctionnels** : navigation au clavier (lien d'évitement), noms accessibles des
   boutons, textes alternatifs, un seul H1 par page, fenêtres modales.
4. **Revue manuelle** des contrastes de la palette et du comportement des composants.

## Résultat

| Contrôle | Résultat |
|---|---|
| axe-core, 24 analyses (12 écrans × 2 tailles) | ✅ **0 violation** après correction |
| ESLint jsx-a11y | ✅ 0 erreur |
| Un seul H1 par page, titres H2/H3 logiques | ✅ vérifié automatiquement |
| Images : texte alternatif utile, décoratives masquées | ✅ |
| Boutons icônes : nom accessible (texte masqué visuellement) | ✅ |

### Défaut trouvé et corrigé

- **Contraste insuffisant du texte orange** (« Express » dans le logo, grand « 404 ») : 2,6:1 au lieu
  de 4,5:1. Remplacé par l'orange foncé `#C2410C` (≈ 5:1). Règle ajoutée à l'identité visuelle.

## Ce qui est en place

- **Clavier** : lien « Aller au contenu », ordre de tabulation naturel, anneau de focus visible sur
  tous les éléments, fenêtres en `<dialog>` natif (focus piégé, fermeture par Échap), menu mobile
  fermé par Échap, boutons « Monter / Descendre » qui gardent le focus après déplacement.
- **Lecteurs d'écran** : libellés reliés aux champs (`label for`), messages d'aide et d'erreur reliés
  par `aria-describedby`, champs en erreur marqués `aria-invalid`, zone `aria-live` qui annonce les
  actions (« Produit supprimé », étape en cours), barre de progression de l'export en `role="progressbar"`
  avec valeur, étape courante `aria-current="step"`, page courante `aria-current="page"`, aperçus du
  catalogue décrits (« Page 2 sur 4 du catalogue… »).
- **Couleurs** : texte principal ≈ 16:1, liens ≈ 7,3:1, texte secondaire ≈ 6,6:1, bouton principal
  (texte foncé sur orange) ≈ 6,2:1. L'information n'est jamais portée par la couleur seule (badges
  avec texte, erreurs avec icône et texte).
- **Couleur choisie par le commerçant dans le PDF** : texte blanc ou foncé calculé automatiquement
  selon le contraste, couleur du prix assombrie si nécessaire.
- **Mobile** : cibles tactiles ≥ 44–48 px, police ≥ 16 px dans les champs, zoom non bloqué.
- **Mouvement** : animations désactivées si l'utilisateur le demande (`prefers-reduced-motion`).
- **Langue** : `lang="fr"` sur toutes les pages.

## Limites et points à vérifier manuellement

- Tests automatisés ≠ test avec de vraies personnes : prévoir un essai avec TalkBack (Android) et
  NVDA (Windows), et avec des commerçants peu à l'aise avec le numérique.
- **Le PDF généré n'est pas un PDF balisé (« tagged PDF »)** : jsPDF ne produit pas la structure
  d'accessibilité. Le texte reste sélectionnable et lisible par la plupart des lecteurs, mais l'ordre
  de lecture n'est pas garanti. Amélioration possible plus tard (voir LIMITES_ET_RISQUES.md).
- Le sélecteur de couleur natif dépend du navigateur (accessibilité variable) : les 10 pastilles
  proposées sont des boutons radio accessibles.
