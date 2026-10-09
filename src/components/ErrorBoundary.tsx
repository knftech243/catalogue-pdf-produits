// Filet de sécurité global : une erreur d'affichage inattendue montre un écran de secours en
// français au lieu d'une page blanche. Rien n'est envoyé sur Internet (l'erreur reste dans la console).

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Une nouvelle valeur (ex. l'adresse de la page) efface l'erreur et réaffiche le contenu. */
  resetKey?: string;
}

interface State {
  error: Error | null;
  resetKey?: string;
}

export function ErrorFallback() {
  return (
    <section className="container not-found" role="alert" aria-labelledby="erreur-titre">
      <h1 id="erreur-titre">Un problème est survenu</h1>
      <p className="lead">Cette page n’a pas pu s’afficher correctement.</p>
      <p>
        Aucune donnée n’a été envoyée sur Internet. Si la sauvegarde sur cet appareil est activée,
        votre catalogue y est toujours enregistré : rechargez la page pour reprendre.
      </p>
      <div className="link-list">
        <button type="button" className="btn btn-dark" onClick={() => window.location.reload()}>
          Recharger la page
        </button>
        <a href="/" className="btn">
          Retour à l’accueil
        </a>
      </div>
    </section>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // Changement de page : on retente l'affichage normal.
    if (props.resetKey !== state.resetKey) return { error: null, resetKey: props.resetKey };
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Catalogue Express] Erreur d’affichage :', error, info.componentStack);
  }

  render() {
    return this.state.error ? <ErrorFallback /> : this.props.children;
  }
}
