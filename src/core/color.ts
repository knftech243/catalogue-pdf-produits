// Outils couleur : contraste lisible quelle que soit la couleur choisie par le commerçant.

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function hexToRgb(hex: string): Rgb {
  const clean = isHexColor(hex) ? hex.slice(1) : '000000';
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

/** Mélange deux couleurs : t = 0 → a, t = 1 → b. */
export function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Texte blanc ou foncé selon ce qui est le plus lisible sur le fond donné. */
export function textOn(background: string, dark = '#16181D', light = '#FFFFFF'): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}

/**
 * Assombrit (ou éclaircit) une couleur jusqu'à obtenir un contraste suffisant sur le fond.
 * Utile quand le commerçant choisit un jaune clair : le prix reste lisible sur fond blanc.
 */
export function readableOn(color: string, background: string, minRatio = 4.5): string {
  if (contrastRatio(color, background) >= minRatio) return color;
  const target = relativeLuminance(background) > 0.5 ? '#000000' : '#FFFFFF';
  for (let t = 0.1; t <= 1.0001; t += 0.1) {
    const candidate = mix(color, target, t);
    if (contrastRatio(candidate, background) >= minRatio) return candidate;
  }
  return target;
}

export function normalizeHex(value: string, fallback: string): string {
  return isHexColor(value) ? value.toUpperCase() : fallback;
}
