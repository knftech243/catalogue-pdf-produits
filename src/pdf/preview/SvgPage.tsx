// Rendu SVG d'une page mise en page : aperçu fidèle au PDF, net à toutes les tailles d'écran.

import { memo } from 'react';
import type { FontKey } from '../measure';
import type { DrawOp, LayoutPage } from '../layout/types';

const FAMILY: Record<'helvetica' | 'times', string> = {
  helvetica: 'Helvetica, Arial, "Liberation Sans", Roboto, sans-serif',
  times: '"Times New Roman", Times, "Liberation Serif", "Noto Serif", serif',
};

function fontAttrs(font: FontKey) {
  const family = font.startsWith('times') ? FAMILY.times : FAMILY.helvetica;
  const bold = font.includes('bold');
  const italic = font.includes('italic') || font.includes('oblique');
  return {
    fontFamily: family,
    fontWeight: bold ? 700 : 400,
    fontStyle: italic ? 'italic' : 'normal',
  } as const;
}

export interface SvgPageProps {
  page: LayoutPage;
  width: number;
  height: number;
  /** Retourne l'URL affichable d'une image (miniature), ou undefined si indisponible. */
  resolveImage: (imageId: string) => string | undefined;
  /** Préfixe unique pour les identifiants de découpe (plusieurs pages sur l'écran). */
  idPrefix: string;
  label: string;
  className?: string;
}

function renderOp(op: DrawOp, key: string, resolveImage: SvgPageProps['resolveImage']) {
  switch (op.kind) {
    case 'rect':
      return (
        <rect
          key={key}
          x={op.x}
          y={op.y}
          width={Math.max(0, op.w)}
          height={Math.max(0, op.h)}
          rx={op.r || undefined}
          fill={op.fill ?? 'none'}
          stroke={op.stroke}
          strokeWidth={op.stroke ? (op.lineWidth ?? 1) : undefined}
          opacity={op.opacity}
        />
      );
    case 'ellipse':
      return (
        <ellipse
          key={key}
          cx={op.cx}
          cy={op.cy}
          rx={op.rx}
          ry={op.ry}
          fill={op.fill ?? 'none'}
          stroke={op.stroke}
          strokeWidth={op.stroke ? (op.lineWidth ?? 1) : undefined}
          opacity={op.opacity}
        />
      );
    case 'line':
      return (
        <line
          key={key}
          x1={op.x1}
          y1={op.y1}
          x2={op.x2}
          y2={op.y2}
          stroke={op.color}
          strokeWidth={op.width}
          strokeDasharray={op.dash ? op.dash.join(' ') : undefined}
        />
      );
    case 'text':
      return (
        <text
          key={key}
          x={op.x}
          y={op.y}
          fontSize={op.size}
          fill={op.color}
          opacity={op.opacity}
          letterSpacing={op.charSpace || undefined}
          transform={op.angle ? `rotate(${-op.angle} ${op.x} ${op.y})` : undefined}
          style={{ whiteSpace: 'pre' }}
          {...fontAttrs(op.font)}
        >
          {op.text}
        </text>
      );
    case 'image': {
      const url = resolveImage(op.imageId);
      const clipId = `${key}-clip`;
      const circle = op.shape === 'circle';
      const clip = circle ? (
        <ellipse cx={op.x + op.w / 2} cy={op.y + op.h / 2} rx={op.w / 2} ry={op.h / 2} />
      ) : (
        <rect x={op.x} y={op.y} width={op.w} height={op.h} rx={op.r || undefined} />
      );
      return (
        <g key={key}>
          <defs>
            <clipPath id={clipId}>{clip}</clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <rect x={op.x} y={op.y} width={op.w} height={op.h} fill={op.bg} />
            {url && (
              <image
                href={url}
                x={op.x}
                y={op.y}
                width={op.w}
                height={op.h}
                preserveAspectRatio={op.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
              />
            )}
          </g>
        </g>
      );
    }
    case 'link':
      return null;
  }
}

function SvgPageInner({
  page,
  width,
  height,
  resolveImage,
  idPrefix,
  label,
  className,
}: SvgPageProps) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x={0} y={0} width={width} height={height} fill="#FFFFFF" />
      {page.ops.map((op, i) => renderOp(op, `${idPrefix}-${i}`, resolveImage))}
    </svg>
  );
}

export const SvgPage = memo(SvgPageInner);
