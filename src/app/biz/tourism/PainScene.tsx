/**
 * 課題セクションの人物イラスト。
 *
 * 悩みを「人の言葉」として見せるための線画。参考にした一般的なLPは黄色や赤を使うが、
 * それは各社のブランド色なので踏襲しない。このページの紺＋緑に落とし、
 * 自治体・観光協会の担当者が上司に見せても軽く見えない線量に留める。
 * 吹き出しの中身はSVGではなくHTMLテキストで持つ（可読・折り返し・読み上げのため）。
 */

const LINE = '#0F2942'
const WEAR_A = '#C7D6E2'
const WEAR_B = '#9FB3C8'
const WEAR_C = '#BFE6D2'

function Figure({ x, wear, pose }: { x: number; wear: string; pose: 'chin' | 'arms' | 'head' }) {
  return (
    <g transform={`translate(${x} 0)`} stroke={LINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* 頭 */}
      <circle cx="0" cy="26" r="15" fill="#fff" />
      {/* 髪 */}
      {pose === 'chin' && <path d="M-15 22c2-12 28-12 30 0 0-6-3-13-15-13S-15 16-15 22z" fill={LINE} stroke="none" />}
      {pose === 'arms' && <path d="M-15 24c0-14 30-14 30 0 1-9-4-15-15-15s-16 6-15 15z" fill={LINE} stroke="none" />}
      {pose === 'head' && <path d="M-15 23c1-13 29-13 30 0 1-8-2-14-15-14s-16 6-15 14z" fill={LINE} stroke="none" />}
      {/* 目 */}
      <circle cx="-5" cy="27" r="1.6" fill={LINE} stroke="none" />
      <circle cx="5" cy="27" r="1.6" fill={LINE} stroke="none" />
      {/* 口 */}
      <path d="M-3 33c2 1.6 4 1.6 6 0" />
      {/* 胴 */}
      <path d="M-17 96V64c0-11 7-19 17-19s17 8 17 19v32z" fill={wear} />
      {/* 腕 */}
      {/* 考えるしぐさ：片手を顎へ。もう一方は自然に下ろす */}
      {pose === 'chin' && <path d="M-17 70c-5 8-4 15 1 18M17 70c4 5 3 10-2 12-4 2-7-1-7-5" />}
      {pose === 'arms' && <path d="M-17 70c-5 8-4 15 1 18M17 70c5 8 4 15-1 18" />}
      {pose === 'head' && <path d="M-17 70c-5 8-4 15 1 18M17 68c3 4 2 9-3 10" />}
      {/* 脚 */}
      <path d="M-9 96v22M9 96v22" />
    </g>
  )
}

export function PainFigures() {
  return (
    <svg viewBox="0 0 300 130" role="img" aria-label="困っている様子の3人の担当者のイラスト" className="h-auto w-full max-w-[420px]">
      <Figure x={44} wear={WEAR_A} pose="chin" />
      <Figure x={150} wear={WEAR_C} pose="head" />
      <Figure x={256} wear={WEAR_B} pose="arms" />
    </svg>
  )
}

/** 吹き出し。しっぽの向きだけ変える */
export function Bubble({
  children, side, dir,
}: { children: React.ReactNode; side: 'left' | 'right'; dir: 'down' | 'up' }) {
  // しっぽは必ず人物のほうを向ける。向きが逆だと吹き出しと人が無関係に見える
  const pos = dir === 'down' ? '-bottom-[9px] border-b' : '-top-[9px] border-t'
  const edge = side === 'left' ? 'left-8 border-l' : 'right-8 border-r'
  return (
    <div className="relative">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,41,66,0.06)]">
        {children}
      </div>
      <span aria-hidden className={`absolute h-4 w-4 rotate-45 border-slate-200 bg-white ${pos} ${edge}`} />
    </div>
  )
}
