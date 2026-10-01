import { DemoPages } from '../components/DemoPages';
import { Icon } from '../components/Icon';
import type { TemplateId } from '../core/types';
import type { DemoId } from '../demo/shops';
import { productsPerPage, TEMPLATE_META, TEMPLATE_ORDER } from '../pdf/layout/meta';
import { Link } from '../router/router';

const DEMO_FOR: Record<TemplateId, DemoId> = {
  minimal: 'epicerie',
  fashion: 'vetements',
  beauty: 'cosmetiques',
  food: 'restaurant',
};

const DETAILS: Record<TemplateId, string[]> = {
  minimal: [
    'Couverture avec mosaïque de vos photos',
    'Prix en couleur, ancien prix barré',
    'Grille aérée de 4, 9 ou 16 produits par page',
  ],
  fashion: [
    'Grande photo en couverture, style magazine',
    'Photos verticales, idéales pour les vêtements portés',
    'Noms en capitales espacées, texte centré',
  ],
  beauty: [
    'Photos rondes sur la couverture',
    'Cartes blanches arrondies, catégories en pastille',
    'Prix dans une pastille à votre couleur',
  ],
  food: [
    'Bandeau de couleur et étiquettes de prix jaunes',
    'Fiches horizontales, parfaites pour un menu',
    'Regroupement par catégories (entrées, plats, boissons…)',
  ],
};

export function TemplatesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container narrow">
          <p className="eyebrow">Modèles</p>
          <h1>Quatre modèles de catalogues, quatre styles</h1>
          <p className="lead">
            Chaque modèle a sa propre couverture, sa grille de produits, sa façon d’afficher le prix
            et son pied de page avec vos coordonnées. Tous existent en A4 portrait et paysage, avec
            la couleur de votre choix.
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 16 }}>
        <div className="container">
          {TEMPLATE_ORDER.map((id) => TEMPLATE_META[id]).map((t) => (
            <article key={t.id} className="template-card" aria-labelledby={`tpl-${t.id}`}>
              <div>
                <h2 id={`tpl-${t.id}`}>{t.name}</h2>
                <p className="lead">{t.tagline}</p>
                <p>{t.description}</p>
                <ul>
                  {DETAILS[t.id].map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                  <li>
                    {productsPerPage(t.id, 'portrait', 'large')} à{' '}
                    {productsPerPage(t.id, 'portrait', 'small')} produits par page en portrait
                  </li>
                </ul>
                <p>
                  <span
                    className="swatch"
                    style={{ background: t.recommendedColor }}
                    aria-hidden="true"
                  />
                  Idéal pour : {t.idealFor.join(', ')}
                </p>
                <Link to="/creer" className="btn btn-dark">
                  Utiliser ce modèle <Icon name="arrowRight" />
                </Link>
              </div>
              <DemoPages demoId={DEMO_FOR[t.id]} pages={[1, 2, 3]} />
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
