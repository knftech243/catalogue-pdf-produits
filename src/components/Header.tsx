import { useEffect, useState } from 'react';
import { Link, useRouter } from '../router/router';
import { Icon } from './Icon';
import { Logo } from './Logo';

const NAV = [
  { to: '/modeles', label: 'Modèles' },
  { to: '/exemples', label: 'Exemples' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/faq', label: 'FAQ' },
];

export function Header() {
  const { path } = useRouter();
  const [open, setOpen] = useState(false);

  // Ferme le menu mobile après une navigation.
  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const inCreator = path === '/creer';

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand-link" aria-label="Catalogue Express — accueil">
          <Logo />
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          <button
            type="button"
            className="icon-btn nav-toggle"
            aria-expanded={open}
            aria-controls="menu-principal"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'x' : 'menu'} />
            <span className="visually-hidden">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
          </button>
          <ul id="menu-principal" className={`nav-list${open ? ' is-open' : ''}`}>
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
            {!inCreator && (
              <li className="nav-cta">
                <Link to="/creer" className="btn btn-primary btn-sm">
                  Créer mon catalogue
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
