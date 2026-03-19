'use client'

import { useState } from 'react'
import Link from 'next/link'

const CSS = `
  @keyframes float-orb {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(40px,-30px) scale(1.08); }
    66%      { transform: translate(-25px,20px) scale(0.94); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0   rgba(16,185,129,0.55); }
    70%  { box-shadow: 0 0 0 22px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0   rgba(16,185,129,0); }
  }
  @keyframes slide-up {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes scale-in {
    from { opacity:0; transform:scale(0.88); }
    to   { opacity:1; transform:scale(1); }
  }
  .anim { animation-fill-mode:both; animation-timing-function:cubic-bezier(0.16,1,0.3,1); }
  .a0  { animation: slide-up 0.7s both cubic-bezier(0.16,1,0.3,1) 0.05s; }
  .a1  { animation: slide-up 0.7s both cubic-bezier(0.16,1,0.3,1) 0.15s; }
  .a2  { animation: slide-up 0.7s both cubic-bezier(0.16,1,0.3,1) 0.25s; }
  .a3  { animation: slide-up 0.7s both cubic-bezier(0.16,1,0.3,1) 0.35s; }
  .a4  { animation: slide-up 0.7s both cubic-bezier(0.16,1,0.3,1) 0.45s; }
  .a5  { animation: slide-up 0.7s both cubic-bezier(0.16,1,0.3,1) 0.55s; }
  .link-card {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 22px; border-radius:16px; text-decoration:none;
    transition:transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s;
    cursor:pointer;
  }
  .link-card:hover { transform:translateY(-3px); }
  .link-primary:hover { box-shadow:0 12px 40px rgba(16,185,129,0.4); }
  .link-secondary:hover { box-shadow:0 8px 24px rgba(0,0,0,0.3); }
  .svc-row {
    display:flex; align-items:center; gap:16px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:14px; padding:16px 18px;
    transition:background 0.2s, border-color 0.2s, transform 0.2s cubic-bezier(0.16,1,0.3,1);
    cursor:default;
  }
  .svc-row:hover {
    background:rgba(255,255,255,0.08) !important;
    border-color:rgba(255,255,255,0.14) !important;
    transform:translateX(4px);
  }
`

const services = [
  { name: 'Pivolink',             tag: 'SaaS',           color: '#10b981', desc: 'QRコード・NFCリンク管理',           url: 'https://redirect.tsuratsura.com' },
  { name: 'いとをかし Tsumugi',    tag: 'マーケティングAI', color: '#8b5cf6', desc: 'AI記事・SNS・EC統合管理',           url: null },
  { name: 'komapara',             tag: 'メディア',         color: '#f59e0b', desc: '4コマ漫画ポータルサイト',           url: null },
  { name: 'PRESSLAB',             tag: 'SaaS',           color: '#3b82f6', desc: 'AIプレスリリース配信',              url: null },
  { name: 'WOLFGANG',             tag: 'EC',             color: '#ef4444', desc: 'アパレルブランド EC・SNS統合',       url: null },
]

export default function CardPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText('https://redirect.tsuratsura.com/r/nishikawa').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight: '100vh',
        background: '#080f1a',
        fontFamily: "'Inter','Hiragino Kaku Gothic ProN',sans-serif",
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 背景オーブ */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '-15%', right: '-10%',
            width: 520, height: 520, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 65%)',
            animation: 'float-orb 18s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', left: '-15%',
            width: 420, height: 420, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,249,215,0.10) 0%, transparent 65%)',
            animation: 'float-orb 24s ease-in-out infinite reverse',
          }} />
          {/* グリッド */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
        </div>

        {/* コンテンツ */}
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '56px 20px 72px', position: 'relative', zIndex: 1 }}>

          {/* アバター & プロフィール */}
          <div className="a0" style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 22 }}>
              {/* 外側リング */}
              <div style={{
                position: 'absolute', inset: -6, borderRadius: '50%',
                border: '2px solid rgba(16,185,129,0.35)',
                animation: 'pulse-ring 2.8s cubic-bezier(0.215,0.61,0.355,1) infinite',
              }} />
              {/* 静止リング */}
              <div style={{
                position: 'absolute', inset: -2, borderRadius: '50%',
                border: '2px solid rgba(16,185,129,0.5)',
              }} />
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'linear-gradient(135deg, #43e97b 0%, #10b981 50%, #0d9e6e 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 44, fontWeight: 900, color: '#0f172a',
                boxShadow: '0 8px 40px rgba(16,185,129,0.35)',
              }}>
                西
              </div>
            </div>

            <h1 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              西川
            </h1>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 3, letterSpacing: '0.04em' }}>
              代表取締役 / CEO
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 18, letterSpacing: '0.02em' }}>
              株式会社TSURATSURA
            </div>

            {/* タグ */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['SaaS開発', '大阪発', 'スタートアップ'].map(t => (
                <span key={t} style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                  color: '#10b981', background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 999, padding: '5px 13px',
                }}>{t}</span>
              ))}
            </div>
          </div>

          {/* 仕切り */}
          <div className="a1" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: 28 }} />

          {/* CTAリンク */}
          <div className="a2" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
            <a
              href="https://redirect.tsuratsura.com/login?tab=signup"
              className="link-card link-primary"
              style={{ background: 'linear-gradient(135deg, #10b981, #38f9d7)' }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Pivolinkを無料で試す</div>
                <div style={{ fontSize: 12, color: 'rgba(15,23,42,0.55)', marginTop: 2 }}>QRコード・NFC管理SaaS · クレカ不要</div>
              </div>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0f172a" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>

            <a
              href="https://redirect.tsuratsura.com/contact"
              className="link-card link-secondary"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>お問い合わせ</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>ご相談・お見積もりはお気軽に</div>
              </div>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.4)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {/* URLコピー */}
            <button
              onClick={handleCopy}
              className="link-card link-secondary"
              style={{
                background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.3s',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: copied ? '#10b981' : 'rgba(255,255,255,0.7)' }}>
                  {copied ? 'コピーしました！' : 'このページのURLをコピー'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontFamily: 'monospace' }}>
                  redirect.tsuratsura.com/r/nishikawa
                </div>
              </div>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={copied ? '#10b981' : 'rgba(255,255,255,0.3)'} strokeWidth={2}>
                {copied
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                }
              </svg>
            </button>
          </div>

          {/* サービス一覧 */}
          <div className="a3">
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', marginBottom: 14 }}>
              PRODUCTS &amp; SERVICES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {services.map((s, i) => (
                <div
                  key={s.name}
                  className="svc-row"
                  style={{ animationDelay: `${0.4 + i * 0.07}s` }}
                >
                  {/* カラーバー */}
                  <div style={{ width: 4, height: 36, borderRadius: 4, background: s.color, flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.name}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                        color: s.color, background: `${s.color}18`,
                        padding: '2px 6px', borderRadius: 4,
                      }}>{s.tag}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.01em' }}>{s.desc}</div>
                  </div>

                  {s.url && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0, transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)') }
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)') }
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* フッター */}
          <div className="a5" style={{ textAlign: 'center', marginTop: 44 }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', marginBottom: 24 }} />
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              textDecoration: 'none', opacity: 0.4, transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
            >
              <div style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(to bottom,#43e97b,#10b981)' }} />
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.05em', color: '#10b981' }}>PIVO</span>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>LINK</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>で管理されています</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
