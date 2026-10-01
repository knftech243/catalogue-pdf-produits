// Logo Catalogue Express : pictogramme « catalogue express » + nom. Même dessin que branding/logo.svg.

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="12" fill="#FF7A1A" />
      <path d="M15 11h14l6 6v20a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V13a2 2 0 0 1 2-2Z" fill="#fff" />
      <path d="M29 11v6h6" fill="#FFD2AD" />
      <rect x="17" y="20" width="6.5" height="6.5" rx="1.5" fill="#1B1F3B" />
      <rect x="25" y="20" width="6.5" height="6.5" rx="1.5" fill="#1B1F3B" opacity="0.35" />
      <rect x="17" y="28.5" width="6.5" height="6.5" rx="1.5" fill="#1B1F3B" opacity="0.35" />
      <rect x="25" y="28.5" width="6.5" height="6.5" rx="1.5" fill="#1B1F3B" />
      <path d="M4 30h6M2 35h8" stroke="#1B1F3B" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-text" style={light ? { color: '#fff' } : undefined}>
        Catalogue<span className="logo-accent">Express</span>
      </span>
    </span>
  );
}
