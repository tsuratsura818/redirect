'use client'

// Product Hunt ギャラリー画像生成ページ
// 各カードを 1270×760px で表示 → ブラウザのスクリーンショットで書き出し
// 使い方: /ph-assets にアクセス → Chrome DevTools で幅1270pxに設定してスクショ

const W = 1270
const H = 760

// ─── ロゴ ─────────────────────────────────────────────────────────
function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 6, height: 40, borderRadius: 3,
        background: 'linear-gradient(to bottom, #43e97b, #10b981)',
      }} />
      <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.03em', color: dark ? '#0f172a' : '#ffffff', lineHeight: 1 }}>
        PIVO<span style={{ color: '#10b981' }}>LINK</span>
      </span>
    </div>
  )
}

// ─── Card 1: ヒーロービジュアル ───────────────────────────────────
function Card1() {
  return (
    <div style={{
      width: W, height: H, background: '#0f172a', position: 'relative',
      display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Hiragino Kaku Gothic ProN',sans-serif",
      overflow: 'hidden',
    }}>
      {/* 背景グラデーション */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 40%, rgba(16,185,129,0.18) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.15)' }} />
      <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.1)' }} />

      {/* コンテンツ */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '60px 80px' }}>
        {/* ロゴ */}
        <Logo />

        {/* メインコピー */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: -30 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '6px 18px', marginBottom: 32, alignSelf: 'flex-start' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ color: '#10b981', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em' }}>NOW IN BETA — 20% OFF</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 72, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Change where your<br />
            <span style={{ color: '#10b981' }}>QR codes point.</span>
          </h1>
          <p style={{ margin: '28px 0 0', fontSize: 26, color: 'rgba(255,255,255,0.55)', fontWeight: 400, lineHeight: 1.5 }}>
            Without reprinting. Without replacing NFC tags.<br />
            Just update the URL from a dashboard.
          </p>
        </div>

        {/* ボトム */}
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

// ─── Card 2: ダッシュボード ───────────────────────────────────────
function Card2() {
  const rows = [
    { slug: 'summer-menu',    url: 'https://example.com/menu/summer', scans: 1482, status: true },
    { slug: 'product-nfc-01', url: 'https://shop.example.com/item/42', scans: 873, status: true },
    { slug: 'event-oct',      url: 'https://events.example.com/oct',  scans: 341, status: false },
    { slug: 'recall-notice',  url: 'https://example.com/recall/2026', scans: 2104, status: true },
    { slug: 'catalog-2026',   url: 'https://example.com/catalog',     scans: 629, status: true },
  ]
  return (
    <div style={{
      width: W, height: H, background: '#f8fafc',
      display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Hiragino Kaku Gothic ProN',sans-serif",
      overflow: 'hidden',
    }}>
      {/* ヘッダー */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo dark />
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: '#64748b' }}>
          <span style={{ color: '#10b981', fontWeight: 600 }}>Dashboard</span>
          <span>QR / NFC</span><span>Analytics</span><span>Plan</span>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0' }} />
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* サイドバー */}
        <div style={{ width: 200, background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { icon: '◼', label: 'Dashboard', active: false },
            { icon: '⊞', label: 'QR / NFC', active: true },
            { icon: '📈', label: 'Analytics', active: false },
            { icon: '⚙', label: 'Settings', active: false },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
              background: item.active ? '#f0fdf4' : 'transparent',
              borderRight: item.active ? '3px solid #10b981' : '3px solid transparent',
            }}>
              <span style={{ fontSize: 14, color: item.active ? '#10b981' : '#94a3b8' }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: item.active ? 600 : 400, color: item.active ? '#059669' : '#64748b' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* メインコンテンツ */}
        <div style={{ flex: 1, padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* タイトル＋ボタン */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>QR / NFC Management</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Manage your redirect links. Change destinations anytime.</div>
            </div>
            <div style={{ background: '#10b981', color: '#fff', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 600 }}>+ New Link</div>
          </div>

          {/* テーブル */}
          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', gap: 16 }}>
              {['SLUG', 'DESTINATION URL', 'SCANS', 'STATUS', 'ACTION'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {rows.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: i < rows.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>{row.slug}</span>
                <span style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.url}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{row.scans.toLocaleString()}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: row.status ? '#10b981' : '#94a3b8' }} />
                  <span style={{ fontSize: 12, color: row.status ? '#059669' : '#94a3b8' }}>{row.status ? 'Active' : 'Inactive'}</span>
                </span>
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Edit ›</span>
              </div>
            ))}
          </div>

          {/* ラベル */}
          <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            All your QR codes & NFC tags — one dashboard
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card 3: QRコード生成 ────────────────────────────────────────
function Card3() {
  return (
    <div style={{
      width: W, height: H, background: '#0f172a',
      display: 'flex', fontFamily: "'Inter','Hiragino Kaku Gothic ProN',sans-serif",
      overflow: 'hidden',
    }}>
      {/* 左: コピー */}
      <div style={{ flex: 1, padding: '60px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
        <Logo />
        <div style={{ marginTop: 48 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', letterSpacing: '0.1em', marginBottom: 16 }}>QR CODE GENERATOR</div>
          <h2 style={{ margin: 0, fontSize: 52, fontWeight: 800, color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Auto-generate<br />
            <span style={{ color: '#10b981' }}>high-quality</span><br />
            QR codes.
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', marginTop: 24, lineHeight: 1.6 }}>
            Download as PNG or SVG.<br />
            The destination? Change it anytime.
          </p>
        </div>
        <div style={{ marginTop: 48, display: 'flex', gap: 12 }}>
          {['PNG', 'SVG', 'Instant'].map(t => (
            <div key={t} style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '8px 20px', fontSize: 14, fontWeight: 600, color: '#10b981' }}>{t}</div>
          ))}
        </div>
      </div>

      {/* 右: QR+フォームモック */}
      <div style={{ width: 480, padding: '60px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
        {/* フォームカード */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 6 }}>SLUG</div>
            <div style={{ background: '#f8fafc', border: '2px solid #10b981', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#0f172a', fontFamily: 'monospace' }}>summer-menu</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 6 }}>DESTINATION URL</div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#64748b' }}>https://example.com/menu/summer-2026</div>
          </div>

          {/* QRコード（SVGで生成） */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <div style={{ width: 160, height: 160, background: '#0f172a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {/* QR風グリッド */}
              <svg width="130" height="130" viewBox="0 0 130 130">
                {/* 左上 */}
                <rect x="5" y="5" width="35" height="35" rx="4" fill="none" stroke="#10b981" strokeWidth="3"/>
                <rect x="13" y="13" width="19" height="19" rx="2" fill="#10b981"/>
                {/* 右上 */}
                <rect x="90" y="5" width="35" height="35" rx="4" fill="none" stroke="#10b981" strokeWidth="3"/>
                <rect x="98" y="13" width="19" height="19" rx="2" fill="#10b981"/>
                {/* 左下 */}
                <rect x="5" y="90" width="35" height="35" rx="4" fill="none" stroke="#10b981" strokeWidth="3"/>
                <rect x="13" y="98" width="19" height="19" rx="2" fill="#10b981"/>
                {/* 中央データドット */}
                {[
                  [48,5],[56,5],[64,5],[48,13],[64,13],[56,21],[48,29],[64,29],
                  [5,48],[21,48],[29,48],[5,56],[13,56],[29,56],[5,64],[21,64],
                  [48,48],[64,48],[72,48],[80,48],[48,56],[72,56],[80,56],
                  [48,64],[56,64],[80,64],[48,72],[64,72],[80,72],
                  [90,48],[98,48],[106,48],[90,56],[106,56],[90,64],[98,64],
                  [56,90],[72,90],[80,90],[90,90],[48,98],[64,98],[80,98],[106,98],
                  [48,106],[56,106],[72,106],[90,106],[48,114],[56,114],[80,114],[98,114],[106,114],
                ].map(([x, y], i) => (
                  <rect key={i} x={x} y={y} width="6" height="6" rx="1" fill="#ffffff" opacity="0.9"/>
                ))}
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#059669' }}>Download PNG</div>
            <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#059669' }}>Download SVG</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card 4: アナリティクス ─────────────────────────────────────
function Card4() {
  const bars = [420, 380, 510, 470, 620, 580, 710, 690, 840, 760, 920, 880]
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const maxBar = 920
  const devices = [
    { label: 'iOS',     pct: 48, color: '#10b981' },
    { label: 'Android', pct: 35, color: '#3b82f6' },
    { label: 'Desktop', pct: 17, color: '#8b5cf6' },
  ]
  return (
    <div style={{
      width: W, height: H, background: '#f8fafc',
      display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Hiragino Kaku Gothic ProN',sans-serif",
      overflow: 'hidden',
    }}>
      {/* ナビ */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 32 }}>
        <Logo dark />
        <span style={{ fontSize: 14, color: '#10b981', fontWeight: 600 }}>Analytics</span>
      </div>

      <div style={{ flex: 1, padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* タイトル */}
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
          Track every scan — device, region & time breakdown
        </div>

        {/* KPIカード */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Total Scans',   value: '12,847', delta: '+18%', color: '#10b981' },
            { label: 'Active Links',  value: '34',     delta: '+3',   color: '#3b82f6' },
            { label: 'Unique Devices',value: '9,201',  delta: '+22%', color: '#8b5cf6' },
            { label: 'Top Region',    value: 'Tokyo',  delta: '41%',  color: '#f59e0b' },
          ].map(k => (
            <div key={k.label} style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 20px' }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>{k.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{k.value}</div>
              <div style={{ fontSize: 12, color: k.color, fontWeight: 600, marginTop: 4 }}>↑ {k.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 20, flex: 1 }}>
          {/* 棒グラフ */}
          <div style={{ flex: 2, background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Monthly Scans</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              {bars.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', height: `${(v / maxBar) * 160}px`,
                    background: i >= 10 ? 'linear-gradient(to top, #059669, #10b981)' : '#e2e8f0',
                    borderRadius: '4px 4px 0 0',
                  }} />
                  <span style={{ fontSize: 9, color: '#94a3b8' }}>{months[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* デバイス円グラフ */}
          <div style={{ flex: 1, background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Device Breakdown</div>
            {/* 円グラフ（SVG） */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                {/* iOS 48% */}
                <path d="M60,60 L60,8 A52,52,0,0,1,107.9,86" stroke="none" fill="#10b981"/>
                {/* Android 35% */}
                <path d="M60,60 L107.9,86 A52,52,0,0,1,18.1,99.4" stroke="none" fill="#3b82f6"/>
                {/* Desktop 17% */}
                <path d="M60,60 L18.1,99.4 A52,52,0,0,1,60,8" stroke="none" fill="#8b5cf6"/>
                <circle cx="60" cy="60" r="28" fill="#ffffff"/>
                <text x="60" y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">48%</text>
              </svg>
            </div>
            {devices.map(d => (
              <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                <span style={{ fontSize: 13, color: '#64748b', flex: 1 }}>{d.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card 5: 機能一覧 ────────────────────────────────────────────
function Card5() {
  const features = [
    { icon: '⏰', title: 'Schedule Switching', desc: 'Auto-switch destinations at a set date & time. Perfect for seasonal campaigns.' },
    { icon: '📱', title: 'Device Routing',     desc: 'Send iOS, Android, and Desktop users to different pages automatically.' },
    { icon: '🔀', title: 'A/B Testing',        desc: 'Split traffic between two URLs and measure which performs better.' },
    { icon: '🎫', title: 'Cushion Page',        desc: 'Show an announcement or coupon before redirecting. Customizable design.' },
    { icon: '📈', title: 'Analytics',           desc: 'Real-time scan counts by device, region, and time. CSV export included.' },
    { icon: '📋', title: 'Change History',      desc: 'Full audit log of every URL change — who, when, and what was changed.' },
  ]
  return (
    <div style={{
      width: W, height: H, background: '#0f172a',
      display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Hiragino Kaku Gothic ProN',sans-serif",
      overflow: 'hidden', padding: '52px 60px',
    }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 44 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', marginBottom: 8 }}>ADVANCED FEATURES</div>
          <h2 style={{ margin: 0, fontSize: 40, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            More than just a redirect tool.
          </h2>
        </div>
        <Logo />
      </div>

      {/* グリッド */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, flex: 1 }}>
        {features.map(f => (
          <div key={f.title} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ fontSize: 32 }}>{f.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff' }}>{f.title}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── メインページ ────────────────────────────────────────────────
export default function PhAssetsPage() {
  const cards = [
    { id: 1, label: '① ヒーロービジュアル（サムネイル）', component: <Card1 /> },
    { id: 2, label: '② ダッシュボード', component: <Card2 /> },
    { id: 3, label: '③ QRコード生成', component: <Card3 /> },
    { id: 4, label: '④ アナリティクス', component: <Card4 /> },
    { id: 5, label: '⑤ 機能一覧', component: <Card5 /> },
  ]

  return (
    <div style={{ background: '#18181b', minHeight: '100vh', padding: '40px 0', fontFamily: "'Inter',sans-serif" }}>
      {/* 案内 */}
      <div style={{ maxWidth: 1270, margin: '0 auto 40px', padding: '0 20px' }}>
        <h1 style={{ color: '#ffffff', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Product Hunt ギャラリー画像</h1>
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '16px 20px', color: '#10b981', fontSize: 14, lineHeight: 1.7 }}>
          <strong>書き出し手順：</strong><br />
          1. Chrome で開く → DevTools（F12）→ Toggle Device Toolbar（Ctrl+Shift+M）<br />
          2. 幅を <strong>1270</strong>、高さを <strong>760</strong> に設定<br />
          3. 各カードの上でスクロールを合わせて <strong>スクリーンショット</strong>（DevTools → Capture screenshot）<br />
          4. または右クリック → 「要素のスクリーンショットを撮る」でカード単体をキャプチャ
        </div>
      </div>

      {/* 各カード */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48, alignItems: 'center' }}>
        {cards.map(card => (
          <div key={card.id} style={{ width: 1270 }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 10, paddingLeft: 4 }}>
              {card.label} — 1270 × 760px
            </div>
            <div style={{ outline: '2px solid rgba(16,185,129,0.3)', borderRadius: 2 }}>
              {card.component}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 60 }} />
    </div>
  )
}
