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
        <span
          style={{
            fontFamily: "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif",
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#10b981',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '4px',
            padding: '2px 5px',
            marginLeft: '0.5rem',
            letterSpacing: '0.02em',
            alignSelf: 'flex-start',
            marginTop: '4px',
          }}
        >
          β
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
      <span
        style={{
          fontFamily: "'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif",
          fontSize: '0.6rem',
          fontWeight: 700,
          color: '#10b981',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '3px',
          padding: '1px 4px',
          marginLeft: '0.35rem',
          letterSpacing: '0.02em',
          alignSelf: 'flex-start',
          marginTop: '2px',
        }}
      >
        β
      </span>
    </div>
  )
}
