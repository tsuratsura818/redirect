interface Props {
  size?: 'sm' | 'lg'
  className?: string
}

export default function Logo({ size = 'sm', className = '' }: Props) {
  if (size === 'lg') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" width="320" height="64" className={className}>
        <defs>
          <linearGradient id="pivoGradLg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#43e97b"/>
            <stop offset="100%" stopColor="#38f9d7"/>
          </linearGradient>
          <linearGradient id="iconGradLg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#43e97b"/>
            <stop offset="100%" stopColor="#38f9d7"/>
          </linearGradient>
          <linearGradient id="iconBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#43e97b" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#38f9d7" stopOpacity="0.12"/>
          </linearGradient>
        </defs>
        <rect x="4" y="8" width="48" height="48" rx="12" fill="url(#iconBgGrad)"/>
        <g transform="translate(10, 14)">
          <path d="M12 3 L12 22 Q12 32 22 32 L34 32" stroke="url(#iconGradLg)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <polygon points="32,26 40,32 32,38" fill="url(#iconGradLg)"/>
          <circle cx="12" cy="32" r="4" fill="url(#iconGradLg)" opacity="0.25"/>
          <line x1="12" y1="22" x2="12" y2="38" stroke="url(#iconGradLg)" strokeWidth="2" strokeDasharray="2,3" strokeLinecap="round" opacity="0.2"/>
        </g>
        <text x="64" y="44" fontFamily="'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif" fontSize="38" fontWeight="700" fill="url(#pivoGradLg)" letterSpacing="-1">Pivo</text>
        <text x="168" y="44" fontFamily="'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif" fontSize="38" fontWeight="400" fill="#334155" letterSpacing="-1">link</text>
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" width="200" height="40" className={className}>
      <defs>
        <linearGradient id="pivoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#43e97b"/>
          <stop offset="100%" stopColor="#38f9d7"/>
        </linearGradient>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#43e97b"/>
          <stop offset="100%" stopColor="#38f9d7"/>
        </linearGradient>
      </defs>
      <g transform="translate(4, 4)">
        <path d="M8 2 L8 16 Q8 24 16 24 L26 24" stroke="url(#iconGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <polygon points="24,19 30,24 24,29" fill="url(#iconGrad)"/>
        <circle cx="8" cy="24" r="3" fill="url(#iconGrad)" opacity="0.3"/>
      </g>
      <text x="40" y="28" fontFamily="'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif" fontSize="24" fontWeight="700" fill="url(#pivoGrad)" letterSpacing="-0.5">Pivo</text>
      <text x="104" y="28" fontFamily="'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif" fontSize="24" fontWeight="400" fill="#334155" letterSpacing="-0.5">link</text>
    </svg>
  )
}
