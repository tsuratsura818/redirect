import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '西川 | 株式会社TSURATSURA',
  description: '株式会社TSURATSURA 代表取締役 西川のデジタル名刺です。SaaSプロダクト開発・運営。',
  openGraph: {
    title: '西川 | 株式会社TSURATSURA',
    description: 'SaaSプロダクト開発・運営。大阪発スタートアップ。',
  },
}

const services = [
  {
    name: 'Pivolink',
    tag: 'SaaS',
    desc: 'QRコード・NFCタグのリンク先を管理画面からいつでも変更',
    url: 'https://redirect.tsuratsura.com',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    name: 'いとをかし Tsumugi',
    tag: 'マーケティングAI',
    desc: 'AI記事生成・SNS・SEO・EC統合マーケティング管理',
    url: null,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
  },
  {
    name: 'komapara',
    tag: 'メディア',
    desc: '4コマ漫画ポータルサイト',
    url: null,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    name: 'PRESSLAB',
    tag: 'SaaS',
    desc: 'AIによる広報・プレスリリース配信SaaS',
    url: null,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
  },
]

const links = [
  {
    label: 'Pivolink を試す',
    sub: 'QRコード・NFC管理SaaS（無料）',
    url: 'https://redirect.tsuratsura.com',
    primary: true,
  },
  {
    label: 'お問い合わせ',
    sub: 'redirect.tsuratsura.com/contact',
    url: 'https://redirect.tsuratsura.com/contact',
    primary: false,
  },
]

export default function CardPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f2027 100%)',
      fontFamily: "'Inter','Hiragino Kaku Gothic ProN',sans-serif",
      color: '#ffffff',
    }}>
      {/* 背景装飾 */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,249,215,0.08) 0%, transparent 70%)' }} />
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 20px 64px', position: 'relative', zIndex: 1 }}>

        {/* プロフィール */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {/* アバター */}
          <div style={{
            width: 96, height: 96, borderRadius: '50%', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #43e97b, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, fontWeight: 800, color: '#0f172a',
            boxShadow: '0 0 0 4px rgba(16,185,129,0.25), 0 8px 32px rgba(16,185,129,0.2)',
          }}>
            西
          </div>

          {/* 名前 */}
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            西川
          </h1>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
            代表取締役
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 16 }}>
            株式会社TSURATSURA
          </div>

          {/* タグ */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['SaaS開発', '大阪', 'スタートアップ'].map(tag => (
              <span key={tag} style={{
                fontSize: 12, fontWeight: 600, color: '#10b981',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 999, padding: '4px 12px',
              }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* 区切り */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 32 }} />

        {/* CTAリンク */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {links.map(link => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: 14, textDecoration: 'none',
                background: link.primary ? 'linear-gradient(135deg, #10b981, #38f9d7)' : 'rgba(255,255,255,0.06)',
                border: link.primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
                transition: 'opacity 0.2s',
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: link.primary ? '#0f172a' : '#ffffff' }}>
                  {link.label}
                </div>
                <div style={{ fontSize: 12, color: link.primary ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {link.sub}
                </div>
              </div>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={link.primary ? '#0f172a' : 'rgba(255,255,255,0.4)'} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>

        {/* 手がけるサービス */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: 16 }}>
            PRODUCTS & SERVICES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {services.map(s => (
              <div
                key={s.name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '14px 16px',
                }}
              >
                {/* アイコンドット */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: s.bg, border: `1px solid ${s.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{s.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, padding: '2px 7px', borderRadius: 4 }}>{s.tag}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none', flexShrink: 0 }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 区切り */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 28 }} />

        {/* フッター */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
            このページのQRコードは
          </div>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            textDecoration: 'none', fontSize: 13, color: 'rgba(255,255,255,0.5)',
          }}>
            <div style={{
              width: 3, height: 18, borderRadius: 2,
              background: 'linear-gradient(to bottom, #43e97b, #10b981)',
            }} />
            <span style={{ fontWeight: 800, letterSpacing: '0.04em', color: '#10b981' }}>PIVO</span>
            <span style={{ fontWeight: 800, letterSpacing: '0.04em' }}>LINK</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>で管理されています</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
