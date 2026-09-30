// Illustrations vectorielles des produits de démonstration.
// Dessinées dans le code : aucune photo sous licence, aucun téléchargement, poids quasi nul.

import { mix } from '../core/color';

export type IllustrationKind =
  | 'tshirt'
  | 'dress'
  | 'sneaker'
  | 'handbag'
  | 'cap'
  | 'watch'
  | 'lipstick'
  | 'jar'
  | 'pump'
  | 'perfume'
  | 'dropper'
  | 'tube'
  | 'burger'
  | 'pizza'
  | 'fries'
  | 'drink'
  | 'plate'
  | 'skewer'
  | 'sack'
  | 'oil'
  | 'can'
  | 'box'
  | 'carton'
  | 'fruits';

export interface IllustrationSpec {
  kind: IllustrationKind;
  /** Couleur principale de l'objet. */
  main: string;
  /** Couleur d'accent (étiquette, détail). */
  accent: string;
  /** Couleur de fond de la « photo ». */
  bg: string;
}

const dark = (c: string, t = 0.25) => mix(c, '#000000', t);
const light = (c: string, t = 0.35) => mix(c, '#FFFFFF', t);

const shapes: Record<IllustrationKind, (m: string, a: string) => string> = {
  tshirt: (m, a) => `
    <path d="M128 112 L172 88 Q200 116 228 88 L272 112 L322 156 L290 198 L264 182 L264 322 Q264 330 256 330 L144 330 Q136 330 136 322 L136 182 L110 198 L78 156 Z" fill="${m}"/>
    <path d="M172 88 Q200 124 228 88" fill="none" stroke="${dark(m)}" stroke-width="7" stroke-linecap="round"/>
    <path d="M136 182 L136 200 M264 182 L264 200" stroke="${dark(m, 0.15)}" stroke-width="3"/>
    <rect x="178" y="190" width="44" height="44" rx="8" fill="${a}" opacity="0.9"/>
    <path d="M150 112 L150 320" stroke="${light(m, 0.2)}" stroke-width="10" opacity="0.35"/>`,
  dress: (m, a) => `
    <path d="M172 74 L180 74 L184 118 L216 118 L220 74 L228 74 L236 132 Q256 168 296 326 Q200 342 104 326 Q144 168 164 132 Z" fill="${m}"/>
    <rect x="160" y="146" width="80" height="14" rx="4" fill="${a}"/>
    <path d="M200 170 Q170 250 150 318 M200 170 Q230 250 250 318" fill="none" stroke="${dark(m, 0.18)}" stroke-width="4" opacity="0.6"/>
    <circle cx="200" cy="153" r="9" fill="${light(a, 0.3)}"/>`,
  sneaker: (m, a) => `
    <path d="M84 246 Q88 186 146 180 L196 176 Q226 198 262 204 Q322 212 324 246 Z" fill="${m}"/>
    <path d="M78 246 L330 246 Q336 276 312 282 L98 282 Q76 278 78 246 Z" fill="#F7F7F5" stroke="${dark('#F7F7F5', 0.15)}" stroke-width="3"/>
    <path d="M150 232 Q210 196 292 222" fill="none" stroke="${a}" stroke-width="12" stroke-linecap="round"/>
    <path d="M168 186 L186 204 M184 184 L202 202 M200 186 L216 200" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
    <path d="M84 262 L326 262" stroke="${dark('#F7F7F5', 0.12)}" stroke-width="3"/>`,
  handbag: (m, a) => `
    <path d="M148 172 Q148 96 200 96 Q252 96 252 172" fill="none" stroke="${dark(m)}" stroke-width="13" stroke-linecap="round"/>
    <path d="M108 170 L292 170 L314 312 Q316 326 300 326 L100 326 Q84 326 86 312 Z" fill="${m}"/>
    <path d="M108 170 L292 170 L296 196 L104 196 Z" fill="${dark(m, 0.15)}"/>
    <rect x="182" y="186" width="36" height="28" rx="6" fill="${a}"/>
    <path d="M118 300 L282 300" stroke="${light(m)}" stroke-width="3" stroke-dasharray="8 7"/>`,
  cap: (m, a) => `
    <path d="M108 236 Q112 132 200 130 Q288 132 292 236 Z" fill="${m}"/>
    <path d="M108 236 Q56 238 54 258 Q120 268 236 248 L292 236 Z" fill="${dark(m, 0.2)}"/>
    <path d="M200 132 L200 236 M150 142 Q140 190 146 236 M250 142 Q260 190 254 236" fill="none" stroke="${dark(m, 0.12)}" stroke-width="3"/>
    <circle cx="200" cy="130" r="9" fill="${dark(m, 0.3)}"/>
    <rect x="176" y="184" width="48" height="26" rx="5" fill="${a}"/>`,
  watch: (m, a) => `
    <rect x="168" y="64" width="64" height="272" rx="18" fill="${m}"/>
    <path d="M178 90 L222 90 M178 110 L222 110 M178 290 L222 290 M178 310 L222 310" stroke="${dark(m, 0.2)}" stroke-width="3"/>
    <circle cx="200" cy="200" r="68" fill="${a}"/>
    <circle cx="200" cy="200" r="56" fill="#FFFFFF"/>
    <path d="M200 200 L200 162 M200 200 L228 214" stroke="#222222" stroke-width="6" stroke-linecap="round"/>
    <circle cx="200" cy="200" r="6" fill="${a}"/>
    <path d="M200 150 L200 158 M250 200 L242 200 M200 250 L200 242 M150 200 L158 200" stroke="#555555" stroke-width="4"/>`,
  lipstick: (m, a) => `
    <rect x="160" y="222" width="80" height="108" rx="8" fill="${a}"/>
    <rect x="160" y="222" width="80" height="16" fill="${dark(a, 0.2)}"/>
    <rect x="170" y="160" width="60" height="66" rx="4" fill="${light(a, 0.25)}"/>
    <path d="M176 160 L176 104 L224 78 L224 160 Z" fill="${m}"/>
    <path d="M184 150 L184 108" stroke="${light(m, 0.4)}" stroke-width="6" stroke-linecap="round" opacity="0.7"/>`,
  jar: (m, a) => `
    <rect x="116" y="130" width="168" height="46" rx="12" fill="${m}"/>
    <rect x="104" y="172" width="192" height="148" rx="30" fill="${light(a, 0.75)}"/>
    <rect x="104" y="214" width="192" height="62" fill="${a}"/>
    <rect x="150" y="228" width="100" height="10" rx="5" fill="#FFFFFF" opacity="0.9"/>
    <rect x="166" y="248" width="68" height="8" rx="4" fill="#FFFFFF" opacity="0.7"/>
    <path d="M128 190 L128 300" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="0.5"/>`,
  pump: (m, a) => `
    <rect x="186" y="78" width="28" height="44" fill="${dark(a, 0.1)}"/>
    <path d="M176 74 L252 74 L252 90 L176 90 Z" fill="${dark(a, 0.1)}"/>
    <rect x="170" y="118" width="60" height="30" rx="6" fill="${a}"/>
    <rect x="138" y="144" width="124" height="188" rx="26" fill="${m}"/>
    <rect x="154" y="196" width="92" height="84" rx="8" fill="#FFFFFF" opacity="0.92"/>
    <rect x="170" y="216" width="60" height="8" rx="4" fill="${a}"/>
    <rect x="176" y="234" width="48" height="6" rx="3" fill="${light(m, 0.1)}"/>
    <path d="M152 160 L152 312" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.35"/>`,
  perfume: (m, a) => `
    <rect x="176" y="86" width="48" height="44" rx="6" fill="${a}"/>
    <rect x="188" y="126" width="24" height="22" fill="${dark(a, 0.2)}"/>
    <rect x="118" y="146" width="164" height="182" rx="28" fill="${light(m, 0.55)}" opacity="0.95"/>
    <rect x="130" y="186" width="140" height="130" rx="20" fill="${m}"/>
    <rect x="156" y="226" width="88" height="40" rx="6" fill="#FFFFFF" opacity="0.85"/>
    <path d="M136 162 L136 300" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" opacity="0.5"/>`,
  dropper: (m, a) => `
    <path d="M186 70 Q186 50 200 50 Q214 50 214 70 L214 112 L186 112 Z" fill="#2B2B2B"/>
    <rect x="176" y="108" width="48" height="36" rx="5" fill="${a}"/>
    <rect x="148" y="140" width="104" height="190" rx="22" fill="${m}"/>
    <rect x="160" y="200" width="80" height="74" rx="6" fill="#FFFFFF" opacity="0.9"/>
    <rect x="174" y="216" width="52" height="8" rx="4" fill="${a}"/>
    <rect x="178" y="232" width="44" height="6" rx="3" fill="${light(m, 0.2)}"/>
    <path d="M160 156 L160 314" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.35"/>`,
  tube: (m, a) => `
    <path d="M150 70 L250 70 L246 88 L154 88 Z" fill="${dark(m, 0.15)}"/>
    <path d="M154 88 L246 88 L262 296 L138 296 Z" fill="${m}"/>
    <rect x="148" y="294" width="104" height="40" rx="8" fill="${a}"/>
    <rect x="168" y="150" width="64" height="86" rx="6" fill="#FFFFFF" opacity="0.9"/>
    <rect x="180" y="170" width="40" height="8" rx="4" fill="${a}"/>
    <path d="M166 100 L156 280" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.35"/>`,
  burger: (m, a) => `
    <path d="M100 196 Q104 110 200 108 Q296 110 300 196 Z" fill="#E4A146"/>
    <g fill="#FFF3D6"><ellipse cx="160" cy="150" rx="6" ry="4"/><ellipse cx="200" cy="134" rx="6" ry="4"/><ellipse cx="240" cy="150" rx="6" ry="4"/><ellipse cx="182" cy="168" rx="6" ry="4"/><ellipse cx="222" cy="170" rx="6" ry="4"/></g>
    <path d="M92 204 Q110 190 128 204 Q146 218 164 204 Q182 190 200 204 Q218 218 236 204 Q254 190 272 204 Q290 218 308 204 L308 214 L92 214 Z" fill="#4FA83D"/>
    <path d="M96 214 L304 214 L280 242 L246 222 L120 222 Z" fill="${a}"/>
    <rect x="96" y="220" width="208" height="38" rx="18" fill="${m}"/>
    <path d="M100 262 L300 262 Q300 300 262 300 L138 300 Q100 300 100 262 Z" fill="#E4A146"/>`,
  pizza: (m, a) => `
    <circle cx="200" cy="206" r="128" fill="#E3AA59"/>
    <circle cx="200" cy="206" r="108" fill="${m}"/>
    <g fill="#F7D774"><circle cx="160" cy="170" r="22"/><circle cx="238" cy="186" r="24"/><circle cx="196" cy="248" r="26"/><circle cx="252" cy="250" r="16"/><circle cx="140" cy="234" r="16"/></g>
    <g fill="${a}"><circle cx="196" cy="160" r="14"/><circle cx="148" cy="206" r="13"/><circle cx="240" cy="226" r="13"/><circle cx="214" cy="286" r="12"/><circle cx="264" cy="164" r="11"/></g>
    <path d="M200 98 L200 314 M108 150 L292 262 M108 262 L292 150" stroke="#C98B3D" stroke-width="4" opacity="0.55"/>`,
  fries: (m, a) => `
    <g fill="#F4C542" stroke="#D9A21E" stroke-width="2">
      <rect x="148" y="86" width="18" height="140" rx="4" transform="rotate(-10 157 156)"/>
      <rect x="172" y="70" width="18" height="150" rx="4"/>
      <rect x="196" y="80" width="18" height="146" rx="4" transform="rotate(6 205 153)"/>
      <rect x="220" y="76" width="18" height="150" rx="4" transform="rotate(12 229 151)"/>
      <rect x="160" y="100" width="18" height="130" rx="4" transform="rotate(3 169 165)"/>
      <rect x="236" y="98" width="18" height="128" rx="4" transform="rotate(18 245 162)"/>
    </g>
    <path d="M128 168 L272 168 L252 334 L148 334 Z" fill="${m}"/>
    <path d="M128 168 Q200 206 272 168" fill="${dark(m, 0.18)}"/>
    <circle cx="200" cy="262" r="30" fill="${a}"/>
    <circle cx="200" cy="262" r="18" fill="#FFFFFF" opacity="0.85"/>`,
  drink: (m, a) => `
    <path d="M226 64 L252 64 L214 170" fill="none" stroke="${a}" stroke-width="10" stroke-linecap="round"/>
    <path d="M136 120 L264 120 L246 330 Q244 338 236 338 L164 338 Q156 338 154 330 Z" fill="#EAF6FB" opacity="0.9"/>
    <path d="M142 160 L258 160 L246 326 Q244 332 236 332 L164 332 Q156 332 154 326 Z" fill="${m}"/>
    <circle cx="258" cy="128" r="30" fill="${a}"/>
    <circle cx="258" cy="128" r="22" fill="${light(a, 0.45)}"/>
    <path d="M258 106 L258 150 M236 128 L280 128 M243 113 L273 143 M273 113 L243 143" stroke="${a}" stroke-width="2.5"/>
    <rect x="160" y="190" width="22" height="22" rx="4" fill="#FFFFFF" opacity="0.55"/>
    <rect x="200" y="230" width="20" height="20" rx="4" fill="#FFFFFF" opacity="0.45"/>`,
  plate: (m, a) => `
    <ellipse cx="200" cy="222" rx="152" ry="112" fill="#FFFFFF" stroke="#E6E1DA" stroke-width="4"/>
    <ellipse cx="200" cy="222" rx="118" ry="84" fill="#F6F3EE"/>
    <ellipse cx="160" cy="226" rx="66" ry="46" fill="#FFFDF7"/>
    <g fill="#EDE6D6"><circle cx="140" cy="214" r="5"/><circle cx="160" cy="236" r="5"/><circle cx="180" cy="210" r="5"/><circle cx="150" cy="248" r="4"/><circle cx="176" cy="240" r="4"/></g>
    <path d="M214 196 Q246 170 282 196 Q300 230 262 252 Q226 262 214 234 Z" fill="${m}"/>
    <path d="M232 204 Q256 196 272 214" stroke="${light(m, 0.3)}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g fill="${a}"><ellipse cx="222" cy="272" rx="18" ry="9"/><ellipse cx="250" cy="276" rx="16" ry="8"/><ellipse cx="200" cy="170" rx="14" ry="7"/></g>`,
  skewer: (m, a) => `
    <path d="M70 300 L330 110" stroke="#B98A54" stroke-width="8" stroke-linecap="round"/>
    <g transform="rotate(-36 200 205)">
      <rect x="92" y="180" width="46" height="50" rx="12" fill="${m}"/>
      <rect x="142" y="184" width="30" height="42" rx="8" fill="${a}"/>
      <rect x="176" y="180" width="46" height="50" rx="12" fill="${m}"/>
      <rect x="226" y="184" width="30" height="42" rx="8" fill="#4FA83D"/>
      <rect x="260" y="180" width="46" height="50" rx="12" fill="${m}"/>
      <path d="M100 194 L130 194 M184 194 L214 194 M268 194 L298 194" stroke="${dark(m, 0.3)}" stroke-width="4" stroke-linecap="round"/>
    </g>`,
  sack: (m, a) => `
    <path d="M150 96 Q200 80 250 96 L240 128 L160 128 Z" fill="${dark(m, 0.12)}"/>
    <path d="M154 124 L246 124 Q300 170 300 256 Q300 336 200 336 Q100 336 100 256 Q100 170 154 124 Z" fill="${m}"/>
    <path d="M160 126 L240 126" stroke="${dark(m, 0.3)}" stroke-width="8" stroke-linecap="round"/>
    <rect x="132" y="196" width="136" height="94" rx="12" fill="#FFFFFF" opacity="0.94"/>
    <rect x="132" y="196" width="136" height="24" rx="10" fill="${a}"/>
    <rect x="156" y="236" width="88" height="10" rx="5" fill="${a}" opacity="0.8"/>
    <rect x="168" y="256" width="64" height="8" rx="4" fill="#9AA0A6"/>`,
  oil: (m, a) => `
    <rect x="182" y="64" width="36" height="30" rx="5" fill="${a}"/>
    <path d="M188 92 L212 92 L218 132 Q268 150 268 200 L268 318 Q268 336 250 336 L150 336 Q132 336 132 318 L132 200 Q132 150 182 132 Z" fill="${light(m, 0.3)}" opacity="0.95"/>
    <path d="M136 190 L264 190 L264 318 Q264 332 250 332 L150 332 Q136 332 136 318 Z" fill="${m}"/>
    <rect x="150" y="222" width="100" height="62" rx="8" fill="#FFFFFF" opacity="0.92"/>
    <rect x="166" y="238" width="68" height="10" rx="5" fill="${a}"/>
    <path d="M150 164 L150 316" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.4"/>`,
  can: (m, a) => `
    <rect x="130" y="104" width="140" height="222" fill="${m}"/>
    <ellipse cx="200" cy="326" rx="70" ry="16" fill="${dark(m, 0.2)}"/>
    <rect x="130" y="104" width="140" height="222" fill="${m}"/>
    <ellipse cx="200" cy="104" rx="70" ry="16" fill="#D7DBE0"/>
    <ellipse cx="200" cy="104" rx="56" ry="11" fill="#BFC5CC"/>
    <rect x="130" y="176" width="140" height="84" fill="#FFFFFF" opacity="0.92"/>
    <circle cx="200" cy="218" r="26" fill="${a}"/>
    <path d="M144 120 L144 314" stroke="#FFFFFF" stroke-width="8" opacity="0.3"/>`,
  box: (m, a) => `
    <path d="M250 96 L282 118 L282 334 L250 318 Z" fill="${dark(m, 0.25)}"/>
    <path d="M118 96 L250 96 L282 118 L150 118 Z" fill="${light(m, 0.2)}"/>
    <rect x="118" y="96" width="132" height="222" fill="${m}"/>
    <circle cx="184" cy="190" r="40" fill="${a}"/>
    <circle cx="184" cy="190" r="26" fill="#FFFFFF" opacity="0.85"/>
    <rect x="138" y="252" width="92" height="12" rx="6" fill="#FFFFFF" opacity="0.9"/>
    <rect x="150" y="274" width="68" height="8" rx="4" fill="#FFFFFF" opacity="0.7"/>`,
  carton: (m, a) => `
    <path d="M140 110 L200 72 L260 110 Z" fill="${dark('#FFFFFF', 0.08)}"/>
    <rect x="186" y="64" width="28" height="14" fill="${dark('#FFFFFF', 0.15)}"/>
    <rect x="140" y="110" width="120" height="224" fill="#FFFFFF"/>
    <path d="M260 110 L286 128 L286 330 L260 334 Z" fill="${dark('#FFFFFF', 0.1)}"/>
    <rect x="140" y="170" width="120" height="110" fill="${m}"/>
    <circle cx="200" cy="224" r="30" fill="${a}"/>
    <path d="M150 128 L150 322" stroke="#EDEFF2" stroke-width="6"/>`,
  fruits: (m, a) => `
    <path d="M86 256 Q200 300 314 256 L296 322 Q200 350 104 322 Z" fill="#C8955A"/>
    <path d="M92 270 Q200 312 308 270" stroke="#A8743E" stroke-width="4" fill="none"/>
    <circle cx="150" cy="226" r="46" fill="${m}"/>
    <circle cx="250" cy="226" r="46" fill="${dark(m, 0.08)}"/>
    <circle cx="200" cy="196" r="50" fill="${light(m, 0.08)}"/>
    <path d="M200 146 Q214 118 240 120 Q226 146 200 146 Z" fill="${a}"/>
    <path d="M150 180 Q158 160 176 158" stroke="${a}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="184" cy="180" r="10" fill="#FFFFFF" opacity="0.3"/>`,
};

export function illustrationSvg(spec: IllustrationSpec): string {
  const bg = spec.bg;
  const bgInner = mix(bg, '#FFFFFF', 0.45);
  const shadow = mix(bg, '#000000', 0.18);
  // preserveAspectRatio « slice » : dans l'aperçu, l'illustration remplit son cadre comme une photo
  // recadrée (mode « Remplir » par défaut). Le mode « Photo entière » s'applique aux vraies photos.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="g" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="${bgInner}"/><stop offset="1" stop-color="${bg}"/></radialGradient></defs><rect width="400" height="400" fill="url(#g)"/><ellipse cx="200" cy="346" rx="130" ry="16" fill="${shadow}" opacity="0.35"/>${shapes[spec.kind](spec.main, spec.accent)}</svg>`;
}

export function illustrationDataUrl(spec: IllustrationSpec): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(illustrationSvg(spec))}`;
}
