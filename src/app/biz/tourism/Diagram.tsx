/**
 * 法人LPの中心図。**このページで記憶に残す要素はこれ1つ**に絞る（周りは静かに保つ）。
 *
 * 伝えるのは「1枚の掲示物のまま、行き先だけが変わる」という一点。
 * ターゲットは稟議で説明する担当者なので、**スクリーンショットを撮って資料に貼れる**
 * 粒度・コントラストで描く。装飾は足さない。
 */

const NAVY = '#0F2942'
const NAVY_SOFT = '#41566E'
const LINE = '#CBD5E1'
const ACCENT = '#10B981'

function QRGlyph({ x, y, s }: { x: number; y: number; s: number }) {
  const u = s / 7
  const cells = [
    [0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2],
    [4, 0], [5, 0], [6, 0], [4, 1], [6, 1], [4, 2], [5, 2], [6, 2],
    [0, 4], [1, 4], [2, 4], [0, 5], [2, 5], [0, 6], [1, 6], [2, 6],
    [4, 4], [5, 5], [6, 4], [4, 6], [6, 6], [5, 3], [3, 5],
  ]
  return (
    <g>
      {cells.map(([cx, cy], i) => (
        <rect key={i} x={x + cx * u} y={y + cy * u} width={u * 0.86} height={u * 0.86} rx={u * 0.14} fill={NAVY} />
      ))}
    </g>
  )
}

export function SwitchDiagram() {
  const dests = [
    { label: '1回目', to: '定番の名所へ', y: 34 },
    { label: '2回目', to: '少し離れた寺社へ', y: 132 },
    { label: '3回目', to: '商店街・食事処へ', y: 230 },
  ]
  return (
    <svg
      viewBox="0 0 760 320"
      role="img"
      aria-label="1枚の掲示物のQRコードから、スキャン回数に応じて1回目は定番の名所、2回目は少し離れた寺社、3回目は商店街へと行き先が切り替わる図"
      className="w-full h-auto"
    >
      {/* 左：掲示物 */}
      <rect x="8" y="96" width="150" height="128" rx="10" fill="#fff" stroke={LINE} strokeWidth="1.5" />
      <QRGlyph x={51} y={121} s={64} />
      <text x="83" y="207" textAnchor="middle" fontSize="13" fill={NAVY_SOFT}>1枚の掲示物</text>
      <text x="83" y="248" textAnchor="middle" fontSize="12" fill={NAVY_SOFT}>刷り直しなし</text>

      {/* 中央：ルール */}
      <line x1="158" y1="160" x2="236" y2="160" stroke={LINE} strokeWidth="1.5" />
      <rect x="236" y="130" width="150" height="60" rx="8" fill={NAVY} />
      <text x="311" y="155" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="700">切り替えのルール</text>
      <text x="311" y="175" textAnchor="middle" fontSize="12" fill="#9FB3C8">何回目の来訪か</text>

      {/* 右：行き先 */}
      {dests.map((d, i) => (
        <g key={d.label}>
          <path
            d={`M386 160 C 430 160, 430 ${d.y + 28}, 470 ${d.y + 28}`}
            fill="none" stroke={i === 1 ? ACCENT : LINE} strokeWidth={i === 1 ? 2 : 1.5}
          />
          <rect
            x="470" y={d.y} width="282" height="56" rx="8"
            fill="#fff" stroke={i === 1 ? ACCENT : LINE} strokeWidth={i === 1 ? 2 : 1.5}
          />
          <text x="492" y={d.y + 24} fontSize="12" fill={i === 1 ? ACCENT : NAVY_SOFT} fontWeight="700">{d.label}</text>
          <text x="492" y={d.y + 42} fontSize="14" fill={NAVY}>{d.to}</text>
        </g>
      ))}
    </svg>
  )
}

/** 企画カードの見出し脇に置く小さな機構記号。図解の語彙をカード側にも通す。 */
export function MechGlyph({ kind }: { kind: 'step' | 'season' | 'lang' | 'time' | 'ab' | 'urgent' }) {
  const c = 'stroke-current'
  const common = { fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      {kind === 'step' && <g className={c} {...common}><path d="M4 18h4v-4H4zM10 18h4v-8h-4zM16 18h4V6h-4z" /></g>}
      {kind === 'season' && <g className={c} {...common}><circle cx="12" cy="12" r="8" /><path d="M12 4v16M4 12h16" /></g>}
      {kind === 'lang' && <g className={c} {...common}><circle cx="12" cy="12" r="8" /><path d="M12 4c3 3 3 13 0 16M4 12h16" /></g>}
      {kind === 'time' && <g className={c} {...common}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></g>}
      {kind === 'ab' && <g className={c} {...common}><path d="M6 6v12M18 6v12M6 9h12M6 15h12" /></g>}
      {kind === 'urgent' && <g className={c} {...common}><path d="M12 4l8 15H4z" /><path d="M12 10v4M12 17h.01" /></g>}
    </svg>
  )
}
