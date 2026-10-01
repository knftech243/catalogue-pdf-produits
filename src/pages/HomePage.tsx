import { DemoPreview } from '../components/CatalogPreview';
import { FaqList } from '../components/FaqList';
import { Icon, type IconName } from '../components/Icon';
import { PRIVACY_NOTICE } from '../config/site';
import { FAQ_ITEMS } from '../content/faq';
import { DEMO_SHOPS } from '../demo/shops';
import { getTemplate } from '../pdf/layout';
import { Link } from '../router/router';

const BENEFITS: { icon: IconName; title: string; text: string; tone?: string }[] = [
  {
    icon: 'sparkles',
    title: 'Une présentation plus professionnelle',
    text: 'Vos produits sont présentés proprement, avec votre nom, vos couleurs et vos coordonnées sur chaque page.',
  },
  {
    icon: 'clock',
    title: 'Du temps gagné',
    text: 'Un seul fichier à envoyer au lieu de dizaines de photos et de messages avec les prix.',
    tone: 'indigo',
  },
  {
    icon: 'share',
    title: 'Plus facile à partager',
    text: 'Un PDF s’envoie en un geste sur WhatsApp, Facebook, Instagram ou par e-mail, et s’imprime en A4.',
    tone: 'mint',
  },
  {
    icon: 'grid',
    title: 'Des informations mieux organisées',
    text: 'Prix, descriptions, catégories, disponibilités : vos clients trouvent tout au même endroit.',
  },
  {
    icon: 'refresh',
    title: 'Des mises à jour simples',
    text: 'Un prix change ? Modifiez-le et téléchargez une nouvelle version en quelques secondes.',
    tone: 'indigo',
  },
];

const USE_CASES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'shirt', title: 'Vêtements', text: 'Nouvelles collections, tailles et promotions en un seul document.' },
  { icon: 'bottle', title: 'Cosmétiques', text: 'Soins, parfums et maquillage avec prix et disponibilités.' },
  { icon: 'utensils', title: 'Restaurant', text: 'Un menu clair, classé par catégories, facile à envoyer aux clients.' },
  { icon: 'basket', title: 'Épicerie', text: 'Une liste de prix à jour pour les commandes et les livraisons.' },
  { icon: 'watch', title: 'Accessoires', text: 'Sacs, montres, bijoux : mettez chaque pièce en valeur.' },
  { icon: 'shoe', title: 'Chaussures', text: 'Pointures, modèles et prix réunis dans un catalogue propre.' },
];

export function HomePage() {
  return (
    <>
      {/* A. Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Gratuit · sans inscription · en français</p>
            <h1>
              Transformez vos photos produits en <span className="highlight">catalogue PDF</span> professionnel.
            </h1>
            <p className="lead">
              Ajoutez vos photos, vos prix et vos coordonnées. Catalogue Express crée un joli catalogue PDF, prêt à
              envoyer à vos clients sur WhatsApp ou par e-mail. Directement depuis votre téléphone.
            </p>
            <div className="hero-actions">
              <Link to="/creer" className="btn btn-primary btn-lg">
                Créer mon catalogue gratuitement <Icon name="arrowRight" />
              </Link>
              <Link to="/exemples" className="btn btn-lg">
                Voir un exemple
              </Link>
            </div>
            <ul className="hero-points">
              <li>
                <Icon name="check" /> Aucun compte à créer
              </li>
              <li>
                <Icon name="check" /> Fonctionne sur Android
              </li>
              <li>
                <Icon name="check" /> Photos gardées sur votre appareil
              </li>
            </ul>
          </div>
          <div className="hero-visual" aria-label="Exemple : un catalogue PDF envoyé dans une discussion" role="img">
            <div className="hero-phone" aria-hidden="true">
              <div className="hero-phone-screen">
                <div className="hero-chat-head">
                  <span className="hero-chat-avatar" />
                  <span>
                    Kiese Mode
                    <br />
                    <small>en ligne</small>
                  </span>
                </div>
                <div className="hero-chat-body">
                  <div className="bubble">Bonjour ! Vous avez quoi comme nouveautés cette semaine ?</div>
                  <div className="bubble me bubble-file">
                    <span className="bubble-file-icon">PDF</span>
                    <span>
                      <strong>catalogue-kiese-mode.pdf</strong>
                      <span>4 pages · PDF</span>
                    </span>
                  </div>
                  <div className="bubble me">Voici notre catalogue avec tous les prix 🙂</div>
                  <div className="bubble">Merci ! Je prends la robe wax en taille M.</div>
                </div>
              </div>
            </div>
            <div className="hero-page" aria-hidden="true">
              <DemoPreview demoId="vetements" pages={[0]} className="hero-page-list" />
            </div>
            <div className="hero-page hero-page-2" aria-hidden="true">
              <DemoPreview demoId="restaurant" pages={[1]} className="hero-page-list" />
            </div>
          </div>
        </div>
      </section>

      {/* B. Problème */}
      <section className="section alt" aria-labelledby="probleme">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Le problème</p>
            <h2 id="probleme">Envoyer ses produits photo par photo, c’est long et désordonné</h2>
            <p className="lead">
              Beaucoup de vendeurs envoient leurs photos une par une sur WhatsApp, puis répondent aux mêmes questions :
              « C’est combien ? », « Il reste quelles tailles ? ». Le client s’y perd et vous perdez du temps.
            </p>
          </div>
          <div className="problem-grid">
            <div className="compare-card before">
              <h3>Sans catalogue</h3>
              <ul>
                <li>
                  <Icon name="x" /> Des dizaines de photos envoyées une à une
                </li>
                <li>
                  <Icon name="x" /> Les prix se perdent dans la discussion
                </li>
                <li>
                  <Icon name="x" /> Les mêmes questions reviennent sans cesse
                </li>
                <li>
                  <Icon name="x" /> Difficile de transférer vos produits à un ami du client
                </li>
              </ul>
            </div>
            <div className="compare-card after">
              <h3>Avec Catalogue Express</h3>
              <ul>
                <li>
                  <Icon name="check" /> Un seul fichier PDF, clair et complet
                </li>
                <li>
                  <Icon name="check" /> Photo, nom, prix et description pour chaque produit
                </li>
                <li>
                  <Icon name="check" /> Vos coordonnées sur chaque page
                </li>
                <li>
                  <Icon name="check" /> Un document facile à transférer et à imprimer
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* C. Solution */}
      <section className="section" aria-labelledby="solution">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">La solution</p>
            <h2 id="solution">Un catalogue propre, créé à partir de vos photos, prix et descriptions</h2>
            <p className="lead">
              Catalogue Express met vos produits en page automatiquement : couverture, grille de produits, prix bien
              visibles, numéros de page et coordonnées. Vous choisissez simplement le style.
            </p>
          </div>
          <div className="grid-3">
            <div className="feature-card">
              <span className="feature-icon">
                <Icon name="camera" />
              </span>
              <h3>Vos vraies photos</h3>
              <p>Prenez vos produits en photo avec votre téléphone : elles sont recadrées sans être déformées.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon indigo">
                <Icon name="palette" />
              </span>
              <h3>4 modèles au choix</h3>
              <p>Minimal, mode, cosmétiques ou restauration : chaque modèle a sa propre mise en page.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon mint">
                <Icon name="message" />
              </span>
              <h3>Liens WhatsApp dans le PDF</h3>
              <p>Vos clients touchent un produit et vous écrivent directement, avec le nom du produit déjà rempli.</p>
            </div>
          </div>
        </div>
      </section>

      {/* D. Fonctionnement */}
      <section className="section sand" aria-labelledby="fonctionnement">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow">Comment ça marche</p>
            <h2 id="fonctionnement">Votre catalogue en 3 étapes</h2>
          </div>
          <ol className="steps">
            <li className="step-card">
              <span className="step-number">1</span>
              <h3>Ajoutez vos produits</h3>
              <p>Une photo, un nom, un prix. Ajoutez plusieurs photos d’un coup puis complétez les prix.</p>
            </li>
            <li className="step-card">
              <span className="step-number">2</span>
              <h3>Choisissez un modèle</h3>
              <p>Sélectionnez un style, votre couleur, le format A4 portrait ou paysage.</p>
            </li>
            <li className="step-card">
              <span className="step-number">3</span>
              <h3>Téléchargez votre PDF</h3>
              <p>Vérifiez l’aperçu, téléchargez le fichier et partagez-le à vos clients.</p>
            </li>
          </ol>
          <p className="center" style={{ marginTop: 28 }}>
            <Link to="/creer" className="btn btn-dark btn-lg">
              Commencer maintenant <Icon name="arrowRight" />
            </Link>
          </p>
        </div>
      </section>

      {/* E. Bénéfices */}
      <section className="section" aria-labelledby="benefices">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Ce que vous y gagnez</p>
            <h2 id="benefices">Des avantages concrets, sans promesse magique</h2>
          </div>
          <div className="grid-3">
            {BENEFITS.map((b) => (
              <div className="feature-card" key={b.title}>
                <span className={`feature-icon ${b.tone ?? ''}`}>
                  <Icon name={b.icon} />
                </span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* F. Cas d'usage */}
      <section className="section alt" aria-labelledby="usages">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Pour qui ?</p>
            <h2 id="usages">Pensé pour les petits commerces</h2>
            <p className="lead">Vendeurs WhatsApp, boutiques, restaurants, épiceries : en Afrique comme dans la diaspora.</p>
          </div>
          <div className="grid-3">
            {USE_CASES.map((u) => (
              <div className="usecase-card" key={u.title}>
                <span className="feature-icon">
                  <Icon name={u.icon} />
                </span>
                <div>
                  <h3>{u.title}</h3>
                  <p>{u.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* G. Aperçus */}
      <section className="section" aria-labelledby="apercus">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Aperçus</p>
            <h2 id="apercus">Des exemples de catalogues créés avec l’outil</h2>
            <p className="lead">Boutiques fictives, illustrations dessinées pour la démonstration.</p>
          </div>
          <div className="showcase">
            {DEMO_SHOPS.map((demo) => (
              <Link key={demo.id} to="/exemples" className="showcase-item" aria-label={`Voir l’exemple ${demo.label}`}>
                <DemoPreview demoId={demo.id} pages={[0]} />
                <h3>{demo.label}</h3>
                <p>Modèle {getTemplate(demo.settings.templateId).name}</p>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            <Link to="/exemples" className="btn">
              Voir les exemples en détail <Icon name="arrowRight" />
            </Link>
          </p>
        </div>
      </section>

      {/* H. Gratuit et Premium */}
      <section className="section sand" aria-labelledby="offres">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Offres</p>
            <h2 id="offres">Gratuit aujourd’hui, Premium bientôt</h2>
            <p className="lead">Nous préférons être clairs : le paiement n’est pas encore ouvert. Tout ce qui est gratuit fonctionne vraiment.</p>
          </div>
          <div className="pricing-grid">
            <div className="plan featured">
              <span className="badge badge-free">Disponible</span>
              <h3>Aperçu gratuit</h3>
              <p>Créez votre catalogue et vérifiez chaque page à l’écran, sans limite de temps.</p>
            </div>
            <div className="plan">
              <span className="badge badge-free">Disponible</span>
              <h3>Export de démonstration</h3>
              <p>Téléchargez un vrai PDF utilisable, avec une mention « version démo » discrète, jusqu’à 50 produits.</p>
            </div>
            <div className="plan">
              <span className="badge badge-soon">Bientôt</span>
              <h3>Premium</h3>
              <p>Sans filigrane, meilleure résolution, davantage de produits. Tarif annoncé au lancement.</p>
            </div>
          </div>
          <p style={{ marginTop: 24 }}>
            <Link to="/tarifs" className="btn">
              Comparer les offres <Icon name="arrowRight" />
            </Link>
          </p>
        </div>
      </section>

      {/* J. Confidentialité */}
      <section className="section" aria-labelledby="confidentialite">
        <div className="container">
          <div className="privacy-band">
            <span className="feature-icon mint">
              <Icon name="shield" size={32} />
            </span>
            <div>
              <h2 id="confidentialite">Vos photos restent chez vous</h2>
              <p>
                <strong>{PRIVACY_NOTICE}</strong> Les photos sont redimensionnées et le PDF est fabriqué directement dans
                votre navigateur : aucune image n’est envoyée sur un serveur. Vous pouvez effacer vos données locales à
                tout moment.
              </p>
              <p>
                <Link to="/confidentialite">Lire la politique de confidentialité</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* I. FAQ */}
      <section className="section alt" aria-labelledby="faq-accueil">
        <div className="container narrow">
          <div className="section-head">
            <p className="eyebrow">Questions fréquentes</p>
            <h2 id="faq-accueil">Vous vous demandez peut-être…</h2>
          </div>
          <FaqList items={FAQ_ITEMS.slice(0, 10)} />
          <p style={{ marginTop: 20 }}>
            <Link to="/faq">Toutes les questions</Link>
          </p>
        </div>
      </section>

      {/* K. Avis clients */}
      <section className="section" aria-labelledby="avis">
        <div className="container narrow">
          <div className="section-head center">
            <p className="eyebrow">Avis clients</p>
            <h2 id="avis">Ils utilisent Catalogue Express</h2>
          </div>
          <p className="reviews-placeholder">Les premiers avis clients seront ajoutés ici après le lancement.</p>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container narrow center">
          <h2>Prêt à créer votre catalogue ?</h2>
          <p className="lead">C’est gratuit, sans inscription, et vos photos ne quittent pas votre téléphone.</p>
          <Link to="/creer" className="btn btn-primary btn-lg">
            Créer mon catalogue gratuitement
          </Link>
        </div>
      </section>
    </>
  );
}
