import { FaqList } from '../components/FaqList';
import { Link } from '../router/router';

export function FaqPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container narrow">
          <p className="eyebrow">FAQ</p>
          <h1>Questions fréquentes</h1>
          <p className="lead">
            Tout ce qu’il faut savoir pour créer et partager votre catalogue PDF.
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 16 }}>
        <div className="container narrow">
          <FaqList headingLevel={2} />
          <p style={{ marginTop: 28 }}>
            Vous ne trouvez pas votre réponse ? <Link to="/contact">Contactez-nous</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
