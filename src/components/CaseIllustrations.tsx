// 活用事例のSVGイラスト

export function RestaurantIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* テーブル */}
      <rect x="30" y="70" width="120" height="8" rx="4" fill="#e2e8f0"/>
      <rect x="50" y="78" width="8" height="30" rx="2" fill="#cbd5e1"/>
      <rect x="122" y="78" width="8" height="30" rx="2" fill="#cbd5e1"/>
      {/* プレート */}
      <ellipse cx="90" cy="60" rx="28" ry="6" fill="#f1f5f9"/>
      <ellipse cx="90" cy="58" rx="22" ry="4" fill="#fff"/>
      {/* NFCタグ（テーブル上） */}
      <rect x="128" y="52" width="28" height="18" rx="4" fill="#3b82f6" opacity="0.15"/>
      <rect x="131" y="55" width="22" height="12" rx="2" fill="#3b82f6" opacity="0.3"/>
      <text x="142" y="64" fontSize="6" fill="#3b82f6" textAnchor="middle" fontWeight="700">NFC</text>
      {/* スマホ（かざす） */}
      <rect x="120" y="20" width="24" height="40" rx="4" fill="#1e293b" transform="rotate(15, 132, 40)"/>
      <rect x="123" y="24" width="18" height="30" rx="2" fill="#60a5fa" transform="rotate(15, 132, 40)"/>
      {/* 電波マーク */}
      <path d="M148 38 Q152 34 148 30" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M150 40 Q156 34 150 28" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.4"/>
      {/* 矢印 */}
      <path d="M90 20 L90 10 L100 15 Z" fill="#10b981" opacity="0.6"/>
      <text x="70" y="14" fontSize="7" fill="#10b981" fontWeight="600">季節メニュー</text>
    </svg>
  )
}

export function RetailIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tシャツ */}
      <path d="M60 35 L75 25 L90 30 L105 25 L120 35 L110 45 L110 85 L70 85 L70 45 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5"/>
      {/* 商品タグ */}
      <rect x="105" y="40" width="30" height="20" rx="3" fill="#6366f1" opacity="0.2"/>
      <rect x="108" y="43" width="24" height="14" rx="2" fill="#6366f1" opacity="0.3"/>
      <circle cx="133" cy="43" r="3" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.5"/>
      <text x="120" y="53" fontSize="5.5" fill="#6366f1" textAnchor="middle" fontWeight="700">NFC TAG</text>
      {/* 矢印：タグ→EC */}
      <path d="M140 50 L155 50" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3,2"/>
      <path d="M153 46 L159 50 L153 54" fill="#6366f1"/>
      {/* ECアイコン */}
      <rect x="155" y="38" width="22" height="24" rx="3" fill="#6366f1" opacity="0.15"/>
      <text x="166" y="52" fontSize="6" fill="#6366f1" textAnchor="middle" fontWeight="600">EC</text>
      <text x="166" y="58" fontSize="4" fill="#6366f1" textAnchor="middle">購入</text>
    </svg>
  )
}

export function RealEstateIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* チラシ */}
      <rect x="20" y="20" width="60" height="80" rx="4" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
      <rect x="28" y="30" width="44" height="6" rx="1" fill="#e2e8f0"/>
      <rect x="28" y="40" width="44" height="24" rx="2" fill="#dbeafe"/>
      <text x="50" y="55" fontSize="6" fill="#3b82f6" textAnchor="middle">物件A</text>
      {/* QRコード */}
      <rect x="36" y="70" width="28" height="28" rx="2" fill="#1e293b" opacity="0.1"/>
      <rect x="40" y="74" width="20" height="20" rx="1" fill="#1e293b" opacity="0.2"/>
      {/* 矢印 */}
      <path d="M90 60 L110 60" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,3"/>
      <path d="M108 55 L115 60 L108 65" fill="#3b82f6"/>
      {/* 差し替え後 */}
      <rect x="118" y="35" width="48" height="50" rx="4" fill="#10b981" opacity="0.1" stroke="#10b981" strokeWidth="1"/>
      <text x="142" y="55" fontSize="6" fill="#10b981" textAnchor="middle" fontWeight="600">物件B</text>
      <text x="142" y="65" fontSize="5" fill="#10b981" textAnchor="middle">に差し替え</text>
      <text x="142" y="75" fontSize="4" fill="#10b981" textAnchor="middle" opacity="0.7">チラシそのまま</text>
    </svg>
  )
}

export function EventIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* カレンダー */}
      <rect x="55" y="15" width="70" height="65" rx="6" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
      <rect x="55" y="15" width="70" height="18" rx="6" fill="#3b82f6" opacity="0.15"/>
      <text x="90" y="29" fontSize="7" fill="#3b82f6" textAnchor="middle" fontWeight="700">年間スケジュール</text>
      {/* 月ブロック */}
      {[0,1,2,3].map(i => (
        <g key={i}>
          <rect x={62 + i * 15} y="40" width="12" height="10" rx="2" fill={i === 1 ? '#3b82f6' : '#f1f5f9'} opacity={i === 1 ? 0.3 : 1}/>
          <text x={68 + i * 15} y="48" fontSize="5" fill={i === 1 ? '#3b82f6' : '#94a3b8'} textAnchor="middle">{['4月','5月','6月','7月'][i]}</text>
        </g>
      ))}
      {/* 同じQR */}
      <rect x="65" y="58" width="16" height="16" rx="2" fill="#1e293b" opacity="0.15"/>
      <text x="73" y="69" fontSize="4" fill="#1e293b" textAnchor="middle">QR</text>
      <text x="100" y="68" fontSize="5.5" fill="#3b82f6" fontWeight="600">← 同じ1枚でOK</text>
      {/* チラシ */}
      <rect x="30" y="85" width="120" height="20" rx="4" fill="#f59e0b" opacity="0.1" stroke="#f59e0b" strokeWidth="1"/>
      <text x="90" y="98" fontSize="6" fill="#f59e0b" textAnchor="middle" fontWeight="600">毎月イベントページが自動で切り替わる</text>
    </svg>
  )
}

export function SalonIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 名刺 */}
      <rect x="25" y="30" width="80" height="50" rx="5" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5" transform="rotate(-3, 65, 55)"/>
      <rect x="33" y="40" width="30" height="4" rx="1" fill="#1e293b" opacity="0.6" transform="rotate(-3, 65, 55)"/>
      <rect x="33" y="48" width="50" height="3" rx="1" fill="#e2e8f0" transform="rotate(-3, 65, 55)"/>
      <rect x="33" y="55" width="50" height="3" rx="1" fill="#e2e8f0" transform="rotate(-3, 65, 55)"/>
      {/* QR on 名刺 */}
      <rect x="72" y="62" width="14" height="14" rx="2" fill="#3b82f6" opacity="0.2" transform="rotate(-3, 65, 55)"/>
      {/* 矢印フロー */}
      <path d="M115 45 L130 45" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" strokeDasharray="3,2"/>
      <text x="140" y="40" fontSize="5" fill="#ef4444" opacity="0.7">ホットペッパー</text>
      <text x="140" y="48" fontSize="4" fill="#ef4444" opacity="0.5">（旧）</text>
      <path d="M115 70 L130 70" stroke="#10b981" strokeWidth="1.5"/>
      <path d="M128 66 L134 70 L128 74" fill="#10b981"/>
      <text x="140" y="65" fontSize="5" fill="#10b981" fontWeight="600">自社予約</text>
      <text x="140" y="73" fontSize="4" fill="#10b981">（新）</text>
      <text x="90" y="105" fontSize="5.5" fill="#475569" textAnchor="middle">名刺を刷り直す必要なし</text>
    </svg>
  )
}

export function TourismIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 案内板 */}
      <rect x="75" y="70" width="6" height="35" rx="1" fill="#cbd5e1"/>
      <rect x="50" y="30" width="56" height="42" rx="5" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
      <rect x="56" y="36" width="44" height="6" rx="1" fill="#3b82f6" opacity="0.2"/>
      <text x="78" y="41" fontSize="5" fill="#3b82f6" textAnchor="middle" fontWeight="600">観光案内</text>
      {/* QR on 案内板 */}
      <rect x="66" y="48" width="24" height="18" rx="2" fill="#1e293b" opacity="0.1"/>
      <text x="78" y="60" fontSize="5" fill="#1e293b" textAnchor="middle" opacity="0.5">QR</text>
      {/* デバイス分岐 */}
      <path d="M115 40 L135 25" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,2"/>
      <path d="M115 50 L135 50" stroke="#6366f1" strokeWidth="1" strokeDasharray="3,2"/>
      <path d="M115 60 L135 75" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="142" y="22" fontSize="5" fill="#3b82f6">🍎 日本語</text>
      <text x="142" y="52" fontSize="5" fill="#6366f1">🤖 English</text>
      <text x="142" y="78" fontSize="5" fill="#8b5cf6">🖥 詳細MAP</text>
    </svg>
  )
}

export function ManufacturingIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* パッケージ */}
      <rect x="40" y="25" width="55" height="70" rx="4" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
      <rect x="48" y="33" width="39" height="8" rx="2" fill="#f1f5f9"/>
      <text x="67" y="40" fontSize="5" fill="#64748b" textAnchor="middle">商品パッケージ</text>
      {/* QR on パッケージ */}
      <rect x="55" y="50" width="24" height="24" rx="2" fill="#1e293b" opacity="0.12"/>
      <text x="67" y="65" fontSize="5" fill="#1e293b" textAnchor="middle" opacity="0.4">QR</text>
      {/* 通常時 */}
      <path d="M100 50 L120 40" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="122" y="30" width="40" height="20" rx="3" fill="#3b82f6" opacity="0.1"/>
      <text x="142" y="42" fontSize="5" fill="#3b82f6" textAnchor="middle">📖 取扱説明書</text>
      {/* 緊急時 */}
      <path d="M100 65 L120 75" stroke="#ef4444" strokeWidth="1.5"/>
      <path d="M118 71 L124 75 L118 79" fill="#ef4444"/>
      <rect x="122" y="65" width="40" height="22" rx="3" fill="#ef4444" opacity="0.1" stroke="#ef4444" strokeWidth="1"/>
      <text x="142" y="77" fontSize="5" fill="#ef4444" textAnchor="middle" fontWeight="700">⚠️ リコール告知</text>
      <text x="142" y="84" fontSize="4" fill="#ef4444" textAnchor="middle">即座に切替</text>
    </svg>
  )
}

export function EcIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 段ボール */}
      <rect x="25" y="35" width="60" height="50" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" opacity="0.6"/>
      <path d="M25 50 L55 42 L85 50" stroke="#f59e0b" strokeWidth="1" opacity="0.4"/>
      <text x="55" y="70" fontSize="5" fill="#92400e" textAnchor="middle" opacity="0.7">同梱チラシ</text>
      {/* QR */}
      <rect x="45" y="72" width="20" height="12" rx="2" fill="#1e293b" opacity="0.1"/>
      <text x="55" y="81" fontSize="4.5" fill="#1e293b" textAnchor="middle" opacity="0.4">QR</text>
      {/* A/B分岐 */}
      <path d="M95 55 L115 40" stroke="#3b82f6" strokeWidth="1.5"/>
      <path d="M95 55 L115 70" stroke="#8b5cf6" strokeWidth="1.5"/>
      <text x="97" y="52" fontSize="5" fill="#475569" fontWeight="600">50%</text>
      <text x="97" y="72" fontSize="5" fill="#475569" fontWeight="600">50%</text>
      {/* A */}
      <rect x="118" y="28" width="45" height="22" rx="4" fill="#3b82f6" opacity="0.1" stroke="#3b82f6" strokeWidth="1"/>
      <text x="140" y="38" fontSize="4" fill="#3b82f6" textAnchor="middle" fontWeight="600">パターンA</text>
      <text x="140" y="46" fontSize="5" fill="#3b82f6" textAnchor="middle">⭐ レビュー誘導</text>
      {/* B */}
      <rect x="118" y="58" width="45" height="22" rx="4" fill="#8b5cf6" opacity="0.1" stroke="#8b5cf6" strokeWidth="1"/>
      <text x="140" y="68" fontSize="4" fill="#8b5cf6" textAnchor="middle" fontWeight="600">パターンB</text>
      <text x="140" y="76" fontSize="5" fill="#8b5cf6" textAnchor="middle">🎫 クーポン</text>
      {/* 結果 */}
      <text x="90" y="105" fontSize="5.5" fill="#475569" textAnchor="middle" fontWeight="600">データで効果を比較</text>
    </svg>
  )
}

export function GymIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ドア枠 */}
      <rect x="55" y="15" width="50" height="75" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
      <rect x="58" y="18" width="44" height="69" rx="2" fill="#f8fafc"/>
      <circle cx="96" cy="52" r="3" fill="#cbd5e1"/>
      <text x="80" y="12" fontSize="5" fill="#64748b" textAnchor="middle">入口</text>
      {/* NFCパネル */}
      <rect x="108" y="38" width="26" height="28" rx="4" fill="#6366f1" opacity="0.15" stroke="#6366f1" strokeWidth="1"/>
      <text x="121" y="52" fontSize="5" fill="#6366f1" textAnchor="middle" fontWeight="600">NFC</text>
      <text x="121" y="60" fontSize="4" fill="#6366f1" textAnchor="middle">タップ</text>
      {/* 月替わり */}
      <path d="M138 52 L150 52" stroke="#6366f1" strokeWidth="1.5"/>
      <path d="M148 48 L154 52 L148 56" fill="#6366f1"/>
      {/* カレンダーアイコン */}
      <rect x="155" y="30" width="20" height="16" rx="2" fill="#10b981" opacity="0.15"/>
      <text x="165" y="42" fontSize="5" fill="#10b981" textAnchor="middle">3月</text>
      <rect x="155" y="50" width="20" height="16" rx="2" fill="#3b82f6" opacity="0.15"/>
      <text x="165" y="62" fontSize="5" fill="#3b82f6" textAnchor="middle">4月</text>
      <rect x="155" y="70" width="20" height="16" rx="2" fill="#f59e0b" opacity="0.15"/>
      <text x="165" y="82" fontSize="5" fill="#f59e0b" textAnchor="middle">5月</text>
      <text x="90" y="106" fontSize="5.5" fill="#475569" textAnchor="middle" fontWeight="600">月替わりキャンペーンを自動配信</text>
    </svg>
  )
}

export function PublisherIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 雑誌 */}
      <rect x="30" y="20" width="50" height="70" rx="3" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
      <rect x="36" y="26" width="38" height="6" rx="1" fill="#ef4444" opacity="0.2"/>
      <text x="55" y="31" fontSize="5" fill="#ef4444" textAnchor="middle" fontWeight="700">月刊マガジン</text>
      <rect x="36" y="36" width="38" height="20" rx="2" fill="#f1f5f9"/>
      <rect x="36" y="60" width="38" height="3" rx="1" fill="#e2e8f0"/>
      <rect x="36" y="66" width="38" height="3" rx="1" fill="#e2e8f0"/>
      {/* QR */}
      <rect x="44" y="74" width="22" height="12" rx="2" fill="#1e293b" opacity="0.1"/>
      <text x="55" y="83" fontSize="4.5" fill="#1e293b" textAnchor="middle" opacity="0.5">毎号同じQR</text>
      {/* 矢印と切替 */}
      <path d="M88 55 L108 55" stroke="#3b82f6" strokeWidth="1.5"/>
      <path d="M106 51 L112 55 L106 59" fill="#3b82f6"/>
      {/* 話数リスト */}
      {[0,1,2,3].map(i => (
        <g key={i}>
          <rect x="115" y={30 + i * 18} width="48" height="14" rx="3" fill={i === 0 ? '#3b82f6' : '#f1f5f9'} opacity={i === 0 ? 0.15 : 1} stroke={i === 0 ? '#3b82f6' : 'none'} strokeWidth="1"/>
          <text x="139" y={40 + i * 18} fontSize="5" fill={i === 0 ? '#3b82f6' : '#94a3b8'} textAnchor="middle" fontWeight={i === 0 ? '700' : '400'}>
            {[`📕 第${4-i}話 NEW`, `📖 第${3-i}話`, `📖 第${2-i}話`, `📖 第${1}話`][i]}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function EducationIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 教科書 */}
      <rect x="25" y="25" width="55" height="70" rx="4" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
      <rect x="25" y="25" width="55" height="16" rx="4" fill="#8b5cf6" opacity="0.1"/>
      <text x="52" y="37" fontSize="6" fill="#8b5cf6" textAnchor="middle" fontWeight="700">教材テキスト</text>
      <rect x="33" y="48" width="39" height="3" rx="1" fill="#e2e8f0"/>
      <rect x="33" y="55" width="39" height="3" rx="1" fill="#e2e8f0"/>
      <rect x="33" y="62" width="25" height="3" rx="1" fill="#e2e8f0"/>
      {/* QR */}
      <rect x="40" y="72" width="24" height="18" rx="2" fill="#8b5cf6" opacity="0.1"/>
      <text x="52" y="84" fontSize="5" fill="#8b5cf6" textAnchor="middle">QR</text>
      {/* 矢印 */}
      <path d="M88 60 L105 50" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>
      <path d="M88 70 L105 78" stroke="#10b981" strokeWidth="1.5"/>
      <path d="M103 74 L109 78 L103 82" fill="#10b981"/>
      {/* 旧動画 */}
      <rect x="108" y="38" width="50" height="18" rx="3" fill="#ef4444" opacity="0.08"/>
      <text x="133" y="50" fontSize="5" fill="#ef4444" textAnchor="middle" opacity="0.5">🎬 2025年の動画</text>
      {/* 新動画 */}
      <rect x="108" y="68" width="50" height="18" rx="3" fill="#10b981" opacity="0.1" stroke="#10b981" strokeWidth="1"/>
      <text x="133" y="80" fontSize="5" fill="#10b981" textAnchor="middle" fontWeight="600">🎬 2026年の動画</text>
      <text x="90" y="108" fontSize="5" fill="#475569" textAnchor="middle">教材の刷り直し不要</text>
    </svg>
  )
}

export function HotelIllust() {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ベッド */}
      <rect x="20" y="60" width="70" height="30" rx="4" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="24" y="50" width="30" height="14" rx="6" fill="#e2e8f0"/>
      <rect x="58" y="50" width="30" height="14" rx="6" fill="#e2e8f0"/>
      {/* サイドテーブル */}
      <rect x="95" y="55" width="30" height="20" rx="3" fill="#fff" stroke="#e2e8f0" strokeWidth="1"/>
      {/* NFCカード on テーブル */}
      <rect x="100" y="58" width="20" height="14" rx="2" fill="#6366f1" opacity="0.2"/>
      <text x="110" y="68" fontSize="5" fill="#6366f1" textAnchor="middle" fontWeight="600">NFC</text>
      {/* 季節アイコン */}
      <path d="M130 45 L145 30" stroke="#f472b6" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="150" y="26" fontSize="6" fill="#f472b6">🌸 花見</text>
      <path d="M130 55 L145 55" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="150" y="57" fontSize="6" fill="#3b82f6">🏖 海</text>
      <path d="M130 65 L145 80" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="150" y="83" fontSize="6" fill="#f59e0b">🎿 スキー</text>
      <text x="90" y="106" fontSize="5.5" fill="#475569" textAnchor="middle" fontWeight="600">客室から季節の観光ガイドへ</text>
    </svg>
  )
}
