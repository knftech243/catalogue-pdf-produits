import { Link } from '../router/router';

export function NotFoundPage() {
  return (
    <section className="container not-found">
      <p className="big" aria-hidden="true">
        404
      </p>
      <h1>Page introuvable</h1>
      <p className="lead">Cette page n’existe pas ou a été déplacée.</p>
      <div className="link-list">
        <Link to="/" className="btn btn-dark">
          Retour à l’accueil
        </Link>
        <Link to="/creer" className="btn btn-primary">
          Créer mon catalogue
        </Link>
        <Link to="/faq" className="btn">
          Questions fréquentes
        </Link>
      </div>
    </section>
  );
}
