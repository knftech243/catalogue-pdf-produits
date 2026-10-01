import { useState, type FormEvent } from 'react';
import { Icon } from '../components/Icon';
import { SITE } from '../config/site';
import { Link } from '../router/router';

const SUBJECTS = ['Question sur l’outil', 'Signaler un problème', 'Offre Premium', 'Partenariat', 'Autre'];

export function ContactPage() {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const configured = SITE.contactEmail.length > 0;

  // Pas de serveur : le formulaire ouvre l'application e-mail de l'appareil avec le message pré-rempli.
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError('Écrivez votre message (au moins 10 caractères).');
      return;
    }
    setError(null);
    const href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(`[Catalogue Express] ${subject}`)}&body=${encodeURIComponent(message)}`;
    window.location.href = href;
  };

  return (
    <>
      <section className="page-hero">
        <div className="container narrow">
          <p className="eyebrow">Contact</p>
          <h1>Nous contacter</h1>
          <p className="lead">Une question, une idée d’amélioration ou un problème ? Écrivez-nous.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 16 }}>
        <div className="container contact-grid">
          <form className="card contact-form" onSubmit={onSubmit} noValidate>
            {!configured && (
              <p className="notice notice-warning">
                <Icon name="info" />
                <span>L’adresse de contact sera publiée au lancement officiel du service.</span>
              </p>
            )}
            <div className="field">
              <label className="field-label" htmlFor="contact-subject">
                Sujet
              </label>
              <select
                id="contact-subject"
                className="select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!configured}
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="contact-message">
                Votre message
              </label>
              <textarea
                id="contact-message"
                className="textarea"
                rows={6}
                value={message}
                maxLength={2000}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'contact-error' : 'contact-hint'}
                disabled={!configured}
              />
              <p className="field-hint" id="contact-hint">
                N’indiquez jamais de mot de passe, de code ou d’informations bancaires dans un message.
              </p>
              {error && (
                <p className="field-error" id="contact-error">
                  <Icon name="alert" size={16} /> {error}
                </p>
              )}
            </div>
            <button type="submit" className="btn btn-dark" disabled={!configured}>
              <Icon name="mail" /> Ouvrir mon application e-mail
            </button>
            <p className="field-hint">
              Ce formulaire n’envoie rien lui-même : il prépare un e-mail dans votre application de messagerie.
            </p>
          </form>
          <aside className="card">
            <h2 className="h3">Avant d’écrire</h2>
            <p>La plupart des réponses se trouvent dans la <Link to="/faq">foire aux questions</Link>.</p>
            {configured && (
              <p>
                E-mail : <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
              </p>
            )}
            <p className="small-note">
              <Icon name="shield" size={18} /> Vos photos et vos catalogues restent sur votre appareil : nous n’y avons
              pas accès. Pour un problème, décrivez-le ou joignez une capture d’écran.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
