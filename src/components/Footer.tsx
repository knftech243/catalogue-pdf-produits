import { SITE } from '../config/site';
import { Link } from '../router/router';
import { Logo } from './Logo';

const SOCIAL_LABELS: Record<keyof typeof SITE.social, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
};

export function Footer() {
  // Seuls les comptes réellement configurés (variables d'environnement) sont affichés.
  const socials = (Object.keys(SITE.social) as (keyof typeof SITE.social)[]).filter(
    (k) => SITE.social[k],
  );
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p>
            Transformez vos photos produits en catalogue PDF professionnel, prêt à partager. Vos
            photos restent sur votre appareil.
          </p>
          <Link to="/creer" className="btn btn-primary btn-sm">
            Créer mon catalogue
          </Link>
        </div>
        <nav aria-label="Produit" className="footer-col">
          <h2 className="footer-title">Produit</h2>
          <ul>
            <li>
              <Link to="/creer">Créer mon catalogue</Link>
            </li>
            <li>
              <Link to="/modeles">Modèles</Link>
            </li>
            <li>
              <Link to="/exemples">Exemples</Link>
            </li>
            <li>
              <Link to="/tarifs">Tarifs</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Informations légales" className="footer-col">
          <h2 className="footer-title">Informations</h2>
          <ul>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/confidentialite">Politique de confidentialité</Link>
            </li>
            <li>
              <Link to="/conditions-utilisation">Conditions d’utilisation</Link>
            </li>
            <li>
              <Link to="/remboursement">Politique de remboursement</Link>
            </li>
            <li>
              <Link to="/mentions-legales">Mentions légales</Link>
            </li>
          </ul>
        </nav>
        {socials.length > 0 && (
          <nav aria-label="Réseaux sociaux" className="footer-col">
            <h2 className="footer-title">Suivez-nous</h2>
            <ul>
              {socials.map((key) => (
                <li key={key}>
                  <a href={SITE.social[key]} target="_blank" rel="noopener noreferrer">
                    {SOCIAL_LABELS[key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="container footer-bottom">
        <p suppressHydrationWarning>© {year} Catalogue Express. Tous droits réservés.</p>
        <p>Fait pour les commerçants francophones, en Afrique et dans la diaspora.</p>
      </div>
    </footer>
  );
}
