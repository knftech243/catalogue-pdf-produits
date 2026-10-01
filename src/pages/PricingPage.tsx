import { Icon } from '../components/Icon';
import { PLANS } from '../config/plans';
import { Link } from '../router/router';

export function PricingPage() {
  const free = PLANS.free.entitlements;
  return (
    <>
      <section className="page-hero">
        <div className="container narrow">
          <p className="eyebrow">Tarifs</p>
          <h1>Commencez gratuitement</h1>
          <p className="lead">
            Catalogue Express est utilisable gratuitement dès aujourd’hui. Une offre Premium est en préparation :{' '}
            <strong>le paiement n’est pas encore ouvert</strong> et aucun achat n’est possible pour le moment.
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 16 }}>
        <div className="container">
          <div className="pricing-grid">
            <div className="plan featured">
              <span className="badge badge-free">Disponible maintenant</span>
              <h2 className="h3">Gratuit</h2>
              <p className="plan-price">
                0 $ <small>sans inscription</small>
              </p>
              <ul>
                <li>
                  <Icon name="check" /> Création du catalogue et aperçu illimités
                </li>
                <li>
                  <Icon name="check" /> Les 4 modèles, portrait et paysage
                </li>
                <li>
                  <Icon name="check" /> Logo, couleur, coordonnées et liens WhatsApp
                </li>
                <li>
                  <Icon name="check" /> Export PDF de démonstration, jusqu’à {free.maxProductsPerExport} produits
                </li>
                <li className="muted">
                  <Icon name="info" /> Mention « version démo » discrète sur les pages
                </li>
              </ul>
              <Link to="/creer" className="btn btn-primary btn-block">
                Créer mon catalogue
              </Link>
            </div>
            <div className="plan">
              <span className="badge badge-soon">En préparation</span>
              <h2 className="h3">Premium</h2>
              <p className="plan-price">
                — <small>tarif annoncé au lancement</small>
              </p>
              <ul>
                <li>
                  <Icon name="sparkles" /> Export sans filigrane
                </li>
                <li>
                  <Icon name="sparkles" /> Davantage de produits par catalogue
                </li>
                <li>
                  <Icon name="sparkles" /> Photos en meilleure résolution
                </li>
                <li>
                  <Icon name="sparkles" /> Couverture personnalisée
                </li>
                <li>
                  <Icon name="sparkles" /> Plusieurs catalogues et duplication
                </li>
              </ul>
              <button type="button" className="btn btn-block" disabled aria-disabled="true">
                <Icon name="lock" /> Bientôt disponible
              </button>
            </div>
          </div>
          <div className="notice" style={{ marginTop: 24 }}>
            <Icon name="info" />
            <p>
              Quand l’offre Premium ouvrira, le paiement se fera auprès d’un prestataire spécialisé : Catalogue Express ne
              vous demandera jamais votre numéro de carte ou votre code Mobile Money directement. Les conditions de
              remboursement sont décrites dans la <Link to="/remboursement">politique de remboursement</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
