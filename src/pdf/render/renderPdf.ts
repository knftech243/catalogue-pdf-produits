// Rendu des opérations de dessin avec jsPDF : texte vectoriel, photos JPEG, liens cliquables.
// Ce module ne dépend pas du navigateur : il est aussi utilisé par les tests (Node).

import type { jsPDF as JsPdf } from 'jspdf';
import type { FontKey } from '../measure';
import type { DrawOp, ImageOp, LayoutResult } from '../layout/types';

export interface PreparedImage {
  data: Uint8Array;
  format: 'JPEG' | 'PNG';
}

/** Fournit l'image composée (déjà recadrée) pour une opération image. */
export type ImageProvider = (op: ImageOp, key: string) => Promise<PreparedImage | null>;

export interface RenderProgress {
  page: number;
  totalPages: number;
}

const FONT_MAP: Record<FontKey, [string, string]> = {
  helvetica: ['helvetica', 'normal'],
  'helvetica-bold': ['helvetica', 'bold'],
  'helvetica-oblique': ['helvetica', 'italic'],
  'helvetica-boldoblique': ['helvetica', 'bolditalic'],
  times: ['times', 'normal'],
  'times-bold': ['times', 'bold'],
  'times-italic': ['times', 'italic'],
  'times-bolditalic': ['times', 'bolditalic'],
};

/** Clé unique d'une image composée : même photo + même cadre = même image dans le PDF. */
export function imageKey(op: ImageOp): string {
  return [op.imageId, Math.round(op.w), Math.round(op.h), op.fit, op.bg].join('|');
}

function withOpacity(doc: JsPdf, opacity: number | undefined, draw: () => void) {
  if (opacity == null || opacity >= 1) {
    draw();
    return;
  }
  doc.saveGraphicsState();
  // GState est une classe exposée sur l'instance jsPDF (mal typée dans les définitions officielles).
  const GState = (doc as unknown as { GState: new (p: Record<string, number>) => unknown }).GState;
  doc.setGState(new GState({ opacity, 'stroke-opacity': opacity }));
  draw();
  doc.restoreGraphicsState();
}

function paintStyle(fill?: string, stroke?: string): string | null {
  if (fill && stroke) return 'FD';
  if (fill) return 'F';
  if (stroke) return 'S';
  return null;
}

async function drawOp(doc: JsPdf, op: DrawOp, images: ImageProvider, aliases: Map<string, string>) {
  switch (op.kind) {
    case 'rect': {
      const style = paintStyle(op.fill, op.stroke);
      if (!style || op.w <= 0 || op.h <= 0) return;
      withOpacity(doc, op.opacity, () => {
        if (op.fill) doc.setFillColor(op.fill);
        if (op.stroke) {
          doc.setDrawColor(op.stroke);
          doc.setLineWidth(op.lineWidth ?? 1);
        }
        const r = Math.min(op.r ?? 0, op.w / 2, op.h / 2);
        if (r > 0) doc.roundedRect(op.x, op.y, op.w, op.h, r, r, style);
        else doc.rect(op.x, op.y, op.w, op.h, style);
      });
      return;
    }
    case 'ellipse': {
      const style = paintStyle(op.fill, op.stroke);
      if (!style) return;
      withOpacity(doc, op.opacity, () => {
        if (op.fill) doc.setFillColor(op.fill);
        if (op.stroke) {
          doc.setDrawColor(op.stroke);
          doc.setLineWidth(op.lineWidth ?? 1);
        }
        doc.ellipse(op.cx, op.cy, op.rx, op.ry, style);
      });
      return;
    }
    case 'line': {
      doc.setDrawColor(op.color);
      doc.setLineWidth(op.width);
      if (op.dash) doc.setLineDashPattern(op.dash, 0);
      doc.line(op.x1, op.y1, op.x2, op.y2);
      if (op.dash) doc.setLineDashPattern([], 0);
      return;
    }
    case 'text': {
      if (!op.text) return;
      const [family, style] = FONT_MAP[op.font];
      withOpacity(doc, op.opacity, () => {
        doc.setFont(family, style);
        doc.setFontSize(op.size);
        doc.setTextColor(op.color);
        doc.text(op.text, op.x, op.y, {
          baseline: 'alphabetic',
          charSpace: op.charSpace || undefined,
          angle: op.angle || undefined,
        });
      });
      return;
    }
    case 'image': {
      const key = imageKey(op);
      const prepared = await images(op, key);
      doc.saveGraphicsState();
      // Découpe vectorielle : coins arrondis ou cercle, sans pixel superflu.
      if (op.shape === 'circle') {
        doc.ellipse(op.x + op.w / 2, op.y + op.h / 2, op.w / 2, op.h / 2, null);
        doc.clip();
        doc.discardPath();
      } else if (op.r && op.r > 0) {
        const r = Math.min(op.r, op.w / 2, op.h / 2);
        doc.roundedRect(op.x, op.y, op.w, op.h, r, r, null);
        doc.clip();
        doc.discardPath();
      }
      if (prepared) {
        let alias = aliases.get(key);
        if (!alias) {
          alias = `img${aliases.size + 1}`;
          aliases.set(key, alias);
        }
        doc.addImage(prepared.data, prepared.format, op.x, op.y, op.w, op.h, alias, 'NONE');
      } else {
        doc.setFillColor(op.bg);
        doc.rect(op.x, op.y, op.w, op.h, 'F');
      }
      doc.restoreGraphicsState();
      return;
    }
    case 'link': {
      doc.link(op.x, op.y, op.w, op.h, { url: op.url });
      return;
    }
  }
}

/** Dessine toutes les pages du catalogue dans le document jsPDF. */
export async function renderLayout(
  doc: JsPdf,
  layout: LayoutResult,
  images: ImageProvider,
  onPage?: (progress: RenderProgress) => void,
  signal?: AbortSignal,
): Promise<void> {
  const aliases = new Map<string, string>();
  const orientation = layout.width > layout.height ? 'landscape' : 'portrait';
  for (let i = 0; i < layout.pages.length; i++) {
    if (signal?.aborted) throw new DOMException('Génération annulée', 'AbortError');
    if (i > 0) doc.addPage('a4', orientation);
    for (const op of layout.pages[i].ops) {
      await drawOp(doc, op, images, aliases);
    }
    onPage?.({ page: i + 1, totalPages: layout.pages.length });
  }
}
