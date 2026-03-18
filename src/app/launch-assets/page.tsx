'use client'

// 海外SaaSプラットフォーム マルチローンチ用アセット生成ページ
// 各カードをブラウザのスクリーンショットで書き出し

// ─── ロゴ ─────────────────────────────────────────────────────────
function Logo({ dark = false, size = 'md' }: { dark?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const barH = size === 'sm' ? 28 : size === 'lg' ? 52 : 40
  const barW = size === 'sm' ? 4 : size === 'lg' ? 8 : 6
  const fontSize = size === 'sm' ? 18 : size === 'lg' ? 34 : 26
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'sm' ? 7 : 10 }}>
      <div style={{
        width: barW, height: barH, borderRadius: barW / 2,
        background: 'linear-gradient(to bottom, #43e97b, #10b981)',
      }} />
      <span style={{ fontSize, fontWeight: 800, letterSpacing: '0.03em', color: dark ? '#0f172a' : '#ffffff', lineHeight: 1 }}>
        PIVO<span style={{ color: '#10b981' }}>LINK</span>
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: Product Hunt (1270×760)
// ═══════════════════════════════════════════════════════════════════

// PH Card 1: サムネイル
function PhHero() {
  return (
    <div style={{
      width: 1270, height: 760, background: '#0f172a', position: 'relative',
      display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif", overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 40%, rgba(16,185,129,0.18) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.15)' }} />
      <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.1)' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '60px 80px' }}>
        <Logo />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: -30 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '6px 18px', marginBottom: 32, alignSelf: 'flex-start' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ color: '#10b981', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em' }}>NOW IN BETA — 20% OFF</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 72, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Change where your<br />
            <span style={{ color: '#10b981' }}>QR codes point.</span>
          </h1>
          <p style={{ margin: '28px 0 0', fontSize: 26, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
            Without reprinting. Without replacing NFC tags.<br />
            Just update the URL from a dashboard.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>redirect.tsuratsura.com</span>
          <div style={{ display: 'flex', gap: 12 }}>
            {['QR Codes', 'NFC Tags', 'Analytics', 'A/B Test'].map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '6px 14px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// PH Card 2: 料金プラン
function PhPricing() {
  const plans = [
    { name: 'Free', price: '$0', period: '/mo', links: '3 links', scans: '1,000 scans/mo', features: ['QR & NFC management', 'Basic analytics', 'PNG download'], highlight: false },
    { name: 'Pro', price: '$5', period: '/mo', badge: 'BETA 20% OFF', links: '50 links', scans: '50,000 scans/mo', features: ['All Free features', 'Schedule switching', 'Device routing', 'A/B Testing', 'Cushion pages'], highlight: true },
    { name: 'Business', price: '$25', period: '/mo', links: 'Unlimited', scans: 'Unlimited scans', features: ['All Pro features', 'Priority support', 'API access (soon)', 'Team management (soon)'], highlight: false },
  ]
  return (
    <div style={{
      width: 1270, height: 760, background: '#f8fafc',
      display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif", overflow: 'hidden', padding: '52px 72px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 44 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', marginBottom: 8 }}>PRICING</div>
          <h2 style={{ margin: 0, fontSize: 40, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Start free. Scale as you grow.</h2>
        </div>
        <Logo dark />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, flex: 1 }}>
        {plans.map(p => (
          <div key={p.name} style={{
            background: p.highlight ? '#0f172a' : '#ffffff',
            border: p.highlight ? '2px solid #10b981' : '1px solid #e2e8f0',
            borderRadius: 20, padding: '36px 32px', display: 'flex', flexDirection: 'column', position: 'relative',
          }}>
            {p.badge && (
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', borderRadius: 999, padding: '4px 14px', whiteSpace: 'nowrap' }}>{p.badge}</div>
            )}
            <div style={{ fontSize: 14, fontWeight: 700, color: p.highlight ? '#10b981' : '#64748b', marginBottom: 12 }}>{p.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: p.highlight ? '#ffffff' : '#0f172a', lineHeight: 1 }}>{p.price}</span>
              <span style={{ fontSize: 16, color: p.highlight ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>{p.period}</span>
            </div>
            <div style={{ fontSize: 13, color: p.highlight ? 'rgba(255,255,255,0.5)' : '#94a3b8', marginBottom: 24 }}>{p.links} · {p.scans}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {p.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#10b981', fontSize: 14, fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 14, color: p.highlight ? 'rgba(255,255,255,0.8)' : '#374151' }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, background: p.highlight ? '#10b981' : '#f1f5f9', borderRadius: 10, padding: '12px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: p.highlight ? '#ffffff' : '#0f172a' }}>
              Get started free
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// PH Card 3: A/Bテスト & スケジュール
function PhFeatureHighlight() {
  return (
    <div style={{
      width: 1270, height: 760, background: '#0f172a',
      display: 'flex', fontFamily: "'Inter',sans-serif", overflow: 'hidden',
    }}>
      {/* 左: A/Bテスト */}
      <div style={{ flex: 1, padding: '60px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', marginBottom: 20 }}>A/B TESTING</div>
        <h2 style={{ margin: '0 0 24px', fontSize: 42, fontWeight: 800, color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          Split traffic.<br />Find what <span style={{ color: '#10b981' }}>converts.</span>
        </h2>
        <p style={{ margin: '0 0 36px', fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          Route 50% to your new landing page,<br />50% to the original. Measure. Decide.
        </p>
        {/* モック */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'URL A — New landing page', pct: 50, scans: '2,341', color: '#10b981' },
            { label: 'URL B — Original page', pct: 50, scans: '2,289', color: '#3b82f6' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{r.label}</span>
                <span style={{ color: r.color, fontWeight: 700 }}>{r.scans} scans</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右: スケジュール切替 */}
      <div style={{ flex: 1, padding: '60px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', marginBottom: 20 }}>SCHEDULE SWITCHING</div>
        <h2 style={{ margin: '0 0 24px', fontSize: 42, fontWeight: 800, color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          Set it.<br />Forget it. <span style={{ color: '#10b981' }}>It switches.</span>
        </h2>
        <p style={{ margin: '0 0 36px', fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          Schedule URL changes in advance.<br />Perfect for campaigns, events, and seasons.
        </p>
        {/* タイムラインモック */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { time: 'Mar 20 09:00', label: 'Spring sale page', active: true },
            { time: 'Apr 01 00:00', label: 'Regular menu', active: false },
            { time: 'Jul 15 09:00', label: 'Summer campaign', active: false },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, background: s.active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${s.active ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '14px 20px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.active ? '#10b981' : '#475569', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: s.active ? '#ffffff' : 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                <div style={{ fontSize: 12, color: s.active ? '#10b981' : '#475569', marginTop: 2 }}>{s.time}</div>
              </div>
              {s.active && <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '3px 10px', borderRadius: 999 }}>ACTIVE</span>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto' }}><Logo /></div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: BetaList / IndieHackers (1200×630) — OGP兼用
// ═══════════════════════════════════════════════════════════════════

function OgpCard() {
  return (
    <div style={{
      width: 1200, height: 630, background: '#0f172a', position: 'relative',
      display: 'flex', fontFamily: "'Inter',sans-serif", overflow: 'hidden',
    }}>
      {/* 背景 */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 60%, rgba(16,185,129,0.15) 0%, transparent 55%)' }} />
      <div style={{ position: 'absolute', bottom: -80, right: -80, width: 360, height: 360, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.12)' }} />

      {/* 左: テキスト */}
      <div style={{ flex: 1, padding: '64px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <Logo />
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>BETA — 20% OFF</span>
          </div>
          <h1 style={{ margin: '0 0 20px', fontSize: 56, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Dynamic QR &amp; NFC<br />
            <span style={{ color: '#10b981' }}>Link Manager</span>
          </h1>
          <p style={{ margin: 0, fontSize: 20, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            Printed QR codes don't have to be permanent.<br />Change the destination anytime — no reprinting.
          </p>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 15 }}>redirect.tsuratsura.com</span>
      </div>

      {/* 右: 機能ピル */}
      <div style={{ width: 340, padding: '64px 48px 64px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
        {[
          { icon: '🔗', text: 'Update URLs anytime' },
          { icon: '📅', text: 'Schedule switching' },
          { icon: '📱', text: 'Device routing' },
          { icon: '🔀', text: 'A/B testing' },
          { icon: '📊', text: 'Real-time analytics' },
          { icon: '🎫', text: 'Cushion pages' },
        ].map(f => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '14px 18px' }}>
            <span style={{ fontSize: 20 }}>{f.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: AlternativeTo ロゴカード (512×512)
// ═══════════════════════════════════════════════════════════════════

function AlternativeToLogo() {
  return (
    <div style={{
      width: 512, height: 512, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter',sans-serif", gap: 0,
    }}>
      {/* アイコン */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 120, borderRadius: 28, background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)' }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          {/* QRコード風アイコン */}
          <rect x="4" y="4" width="22" height="22" rx="3" stroke="#10b981" strokeWidth="3" fill="none"/>
          <rect x="9" y="9" width="12" height="12" rx="1.5" fill="#10b981"/>
          <rect x="34" y="4" width="22" height="22" rx="3" stroke="#10b981" strokeWidth="3" fill="none"/>
          <rect x="39" y="9" width="12" height="12" rx="1.5" fill="#10b981"/>
          <rect x="4" y="34" width="22" height="22" rx="3" stroke="#10b981" strokeWidth="3" fill="none"/>
          <rect x="9" y="39" width="12" height="12" rx="1.5" fill="#10b981"/>
          {/* 矢印 */}
          <path d="M34 38h14M41 31l7 7-7 7" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <Logo size="lg" />
      <p style={{ margin: '16px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>Dynamic QR &amp; NFC Link Manager</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: Twitter/X カード (1200×628)
// ═══════════════════════════════════════════════════════════════════

function TwitterCard() {
  return (
    <div style={{
      width: 1200, height: 628, background: '#0f172a', position: 'relative',
      display: 'flex', alignItems: 'center', fontFamily: "'Inter',sans-serif", overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.2) 0%, transparent 60%)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 100px', display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 700 }}>
        <Logo size="lg" />
        <h1 style={{ margin: '36px 0 20px', fontSize: 58, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Your QR codes.<br />
          <span style={{ color: '#10b981' }}>Always up to date.</span>
        </h1>
        <p style={{ margin: 0, fontSize: 22, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          Pivolink lets you change where any QR code or NFC tag points — without touching the physical tag.
        </p>
        <div style={{ marginTop: 36, display: 'flex', gap: 14 }}>
          {['Free to start', 'No reprinting', 'Real-time analytics'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// メインページ
// ═══════════════════════════════════════════════════════════════════

type Section = {
  platform: string
  note: string
  size: string
  cards: { label: string; width: number; component: React.ReactNode }[]
}

const sections: Section[] = [
  {
    platform: 'Product Hunt',
    note: 'DevTools → 幅1270px → 各カードをスクリーンショット（Capture node screenshot）',
    size: '1270 × 760px',
    cards: [
      { label: '① Hero / Thumbnail', width: 1270, component: <PhHero /> },
      { label: '② Pricing', width: 1270, component: <PhPricing /> },
      { label: '③ A/B Test & Schedule', width: 1270, component: <PhFeatureHighlight /> },
    ],
  },
  {
    platform: 'BetaList / IndieHackers / OGP',
    note: 'OGP画像・BetaList・IndieHackers 投稿用（1200×630px）— DevTools 幅1200px で書き出し',
    size: '1200 × 630px',
    cards: [
      { label: 'OGP / Social Card', width: 1200, component: <OgpCard /> },
    ],
  },
  {
    platform: 'Twitter / X',
    note: 'Twitter Card 用 — ページ公開後は自動取得（OGPと同じ画像でOK）',
    size: '1200 × 628px',
    cards: [
      { label: 'Twitter Card', width: 1200, component: <TwitterCard /> },
    ],
  },
  {
    platform: 'AlternativeTo / アプリアイコン',
    note: 'AlternativeTo のロゴ登録・各種アプリアイコン用（512×512px）',
    size: '512 × 512px',
    cards: [
      { label: 'Square Logo', width: 512, component: <AlternativeToLogo /> },
    ],
  },
]

export default function LaunchAssetsPage() {
  return (
    <div style={{ background: '#09090b', minHeight: '100vh', padding: '48px 0', fontFamily: "'Inter',sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ maxWidth: 1270, margin: '0 auto 56px', padding: '0 24px' }}>
        <h1 style={{ color: '#ffffff', fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>
          🚀 Pivolink マルチプラットフォーム ローンチアセット
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, margin: 0 }}>
          Product Hunt / BetaList / IndieHackers / AlternativeTo / Twitter(X) 一括書き出し
        </p>

        {/* 投稿文リンク */}
        <div style={{ marginTop: 24, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ color: '#10b981', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📋 投稿文・提出資料</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.8 }}>
            各プラットフォームの投稿テキストは <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>LAUNCH_COPY.md</code> を参照してください。
          </div>
        </div>
      </div>

      {/* 各セクション */}
      {sections.map(section => (
        <div key={section.platform} style={{ marginBottom: 72 }}>
          {/* セクションヘッダー */}
          <div style={{ maxWidth: 1270, margin: '0 auto 20px', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <h2 style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, margin: 0 }}>{section.platform}</h2>
              <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6 }}>{section.size}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>{section.note}</p>
          </div>

          {/* カード群 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'flex-start', paddingLeft: 24 }}>
            {section.cards.map(card => (
              <div key={card.label}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 8, paddingLeft: 2 }}>
                  {card.label} — {section.size}
                </div>
                <div data-card={card.label} style={{ outline: '1px solid rgba(16,185,129,0.25)', borderRadius: 2, display: 'inline-block' }}>
                  {card.component}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ height: 60 }} />
    </div>
  )
}
