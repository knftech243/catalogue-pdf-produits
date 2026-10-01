// Aperçus des catalogues de démonstration, servis comme images SVG statiques (public/apercus/).
// Générés au build par scripts/generate-previews.mjs avec le même moteur que le PDF.

import type { DemoId } from '../demo/shops';

const NAMES: Record<DemoId, string> = {
  vetements: 'Kiese Mode',
  cosmetiques: 'Éclat Naturel',
  restaurant: 'Chez Maman Mado',
  epicerie: 'Épicerie Saveurs d’Afrique',
};

interface Props {
  demoId: DemoId;
  /** Numéros de pages à afficher (1 = couverture). */
  pages?: number[];
  className?: string;
  /** Image visible dès l'arrivée sur la page (sinon chargement différé). */
  eager?: boolean;
  captions?: boolean;
}

export function DemoPages({
  demoId,
  pages = [1, 2],
  className,
  eager = false,
  captions = true,
}: Props) {
  return (
    <div className={`page-list ${className ?? ''}`}>
      {pages.map((n) => (
        <figure key={n} className="pdf-page-frame is-portrait">
          <img
            className="pdf-page"
            src={`/apercus/${demoId}-${n}.svg`}
            width={595}
            height={842}
            alt={
              n === 1
                ? `Couverture du catalogue de démonstration « ${NAMES[demoId]} »`
                : `Page ${n} du catalogue de démonstration « ${NAMES[demoId]} »`
            }
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={eager ? 'high' : undefined}
          />
          {captions && <figcaption>{n === 1 ? 'Couverture' : `Page ${n}`}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
