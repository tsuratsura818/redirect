interface Props {
  size?: 'sm' | 'lg'
  className?: string
}

export default function Logo({ size = 'sm', className = '' }: Props) {
  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-0 ${className}`}>
        <div className="w-1 self-stretch rounded-full" style={{ background: 'linear-gradient(180deg, #43e97b 0%, #38f9d7 100%)', minHeight: '2.5rem' }} />
        <span
          style={{
            fontFamily: "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif",
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: '#0f172a',
            paddingLeft: '0.6rem',
          }}
        >
          PIVO<span style={{ color: '#10b981' }}>LINK</span>
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-0 ${className}`}>
      <div className="w-0.5 self-stretch rounded-full" style={{ background: 'linear-gradient(180deg, #43e97b 0%, #38f9d7 100%)', minHeight: '1.5rem' }} />
      <span
        style={{
          fontFamily: "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif",
          fontSize: '1.15rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          color: '#0f172a',
          paddingLeft: '0.45rem',
        }}
      >
        PIVO<span style={{ color: '#10b981' }}>LINK</span>
      </span>
    </div>
  )
}
