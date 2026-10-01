import { DemoPreview } from '../components/CatalogPreview';
import { Icon } from '../components/Icon';
import { CURRENCIES } from '../core/price';
import { DEMO_SHOPS } from '../demo/shops';
import { getTemplate } from '../pdf/layout';
import { Link } from '../router/router';

const DESCRIPTIONS: Record<string, string> = {
  vetements:
    'Une boutique de mode à Kinshasa présente sa nouvelle collection : robes en wax, chaussures et accessoires, avec prix barrés pour les promotions.',
  cosmetiques:
    'Une boutique de beauté à Abidjan regroupe ses soins, parfums et produits de maquillage, avec des prix en francs CFA.',
  restaurant:
    'Un restaurant de Kinshasa transforme son menu en PDF, classé par catégories : plats, burgers, grillades et boissons, en francs congolais.',
  epicerie:
    'Une épicerie africaine à Bruxelles envoie sa liste de prix à ses clients sur WhatsApp, en euros, avec les disponibilités.',
};

export function ExamplesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container narrow">
          <p className="eyebrow">Exemples</p>
          <h1>Des catalogues PDF prêts à partager</h1>
          <p className="lead">
            Voici quatre boutiques fictives créées avec Catalogue Express. Les aperçus ci-dessous sont calculés avec le
            même moteur que le fichier PDF : ce que vous voyez est ce que vous téléchargez.
          </p>
          <p className="small-note">
            <Icon name="info" size={18} /> Illustrations dessinées pour la démonstration. Le PDF gratuit comporte une
            mention discrète « version démo ».
          </p>
        </div>
      </section>

      {DEMO_SHOPS.map((demo, index) => {
        const template = getTemplate(demo.settings.templateId);
        const currency = CURRENCIES.find((c) => c.code === demo.shop.currency.code);
        return (
          <section key={demo.id} className={`section example-section${index % 2 ? ' alt' : ''}`} aria-labelledby={`ex-${demo.id}`}>
            <div className="container example-grid">
              <div className="example-text">
                <p className="eyebrow">{demo.sector}</p>
                <h2 id={`ex-${demo.id}`}>
                  {demo.label} — « {demo.shop.name} »
                </h2>
                <p>{DESCRIPTIONS[demo.id]}</p>
                <ul className="facts">
                  <li>
                    <Icon name="box" size={18} /> {demo.products.length} produits
                  </li>
                  <li>
                    <Icon name="layout" size={18} /> Modèle {template.name}
                  </li>
                  <li>
                    <Icon name="tag" size={18} /> {currency?.label}
                  </li>
                </ul>
                <Link to={`/creer?exemple=${demo.id}`} className="btn btn-dark">
                  Ouvrir cet exemple dans l’outil <Icon name="arrowRight" />
                </Link>
              </div>
              <DemoPreview demoId={demo.id} pages={[0, 1]} className="example-pages" />
            </div>
          </section>
        );
      })}

      <section className="section cta-band">
        <div className="container narrow center">
          <h2>À vous de jouer</h2>
          <p className="lead">Ajoutez vos propres photos et vos prix : votre catalogue est prêt en quelques minutes.</p>
          <Link to="/creer" className="btn btn-primary btn-lg">
            Créer mon catalogue gratuitement
          </Link>
        </div>
      </section>
    </>
  );
}
