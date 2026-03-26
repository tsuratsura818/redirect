// 業種別LP用のSVGイラスト・モックアップコンポーネント

// ダッシュボードモックアップ（Hero用）
export function DashboardMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* ブラウザバー */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 border-b border-gray-200">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="flex-1 mx-2 bg-white rounded px-2 py-0.5 text-[9px] text-gray-400 text-center">
            redirect.tsuratsura.com/dashboard
          </div>
        </div>
        {/* コンテンツ */}
        <div className="p-4 space-y-3">
          {/* ヘッダー行 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>
              </div>
              <span className="text-xs font-bold text-gray-800">Pivolink</span>
            </div>
            <div className="px-2 py-1 bg-green-100 text-green-700 text-[9px] font-medium rounded">Active</div>
          </div>
          {/* URLカード */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-gray-500">redirect URL</span>
              <span className="text-[9px] text-blue-500">Edit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="8" height="8" rx="1" />
                  <rect x="14" y="2" width="8" height="8" rx="1" />
                  <rect x="2" y="14" width="8" height="8" rx="1" />
                  <rect x="14" y="14" width="4" height="4" rx="0.5" />
                  <rect x="20" y="14" width="2" height="2" rx="0.3" />
                  <rect x="14" y="20" width="2" height="2" rx="0.3" />
                  <rect x="18" y="18" width="4" height="4" rx="0.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-gray-800 truncate">/r/spring-menu</div>
                <div className="text-[9px] text-gray-400 truncate flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                  https://example.com/menu/spring
                </div>
              </div>
            </div>
            {/* 変更アニメーション矢印 */}
            <div className="mt-2 flex items-center gap-2 pl-10">
              <svg className="w-3 h-3 text-blue-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <div className="text-[9px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                URL変更 → 即時反映
              </div>
            </div>
          </div>
          {/* ミニ統計 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'スキャン数', value: '1,247', color: 'text-blue-600' },
              { label: '今日', value: '+38', color: 'text-green-600' },
              { label: 'デバイス', value: '3種', color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-2 text-center">
                <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[8px] text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 装飾ドット */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl" />
      <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-blue-400/20 rounded-full blur-xl" />
    </div>
  )
}

// フロー図（QR → Pivolink → 遷移先）
export function FlowDiagram({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-4 ${className}`}>
      {/* QRコード */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-gray-100">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="2" width="8" height="8" rx="1" />
            <rect x="14" y="2" width="8" height="8" rx="1" />
            <rect x="2" y="14" width="8" height="8" rx="1" />
            <rect x="14" y="14" width="4" height="4" rx="0.5" />
            <rect x="20" y="14" width="2" height="2" rx="0.3" />
            <rect x="14" y="20" width="2" height="2" rx="0.3" />
            <rect x="18" y="18" width="4" height="4" rx="0.5" />
          </svg>
        </div>
        <span className="text-[10px] font-medium text-white/70">印刷済みQR</span>
      </div>
      {/* 矢印 */}
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      {/* Pivolink */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 rounded-xl shadow-lg flex items-center justify-center border-2 border-blue-400 relative">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <span className="text-[10px] font-medium text-white/70">Pivolink</span>
      </div>
      {/* 矢印（分岐） */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <svg className="w-6 h-4 sm:w-8 sm:h-5 text-white/50 -rotate-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <svg className="w-6 h-4 sm:w-8 sm:h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <svg className="w-6 h-4 sm:w-8 sm:h-5 text-white/50 rotate-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
      {/* 遷移先 */}
      <div className="flex flex-col gap-1.5">
        {[
          { label: '春メニュー', color: 'bg-pink-400' },
          { label: '夏メニュー', color: 'bg-orange-400' },
          { label: 'クーポン', color: 'bg-green-400' },
        ].map(d => (
          <div key={d.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
            <span className="text-[10px] text-white/80">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Before/After イラスト
export function BeforeIllust({ className = '' }: { className?: string }) {
  return (
    <svg className={`${className}`} viewBox="0 0 120 80" fill="none">
      {/* 人 */}
      <circle cx="30" cy="20" r="8" fill="#FCA5A5" />
      <rect x="22" y="30" width="16" height="24" rx="4" fill="#FCA5A5" />
      {/* QRシール（バツ印） */}
      <rect x="60" y="10" width="50" height="60" rx="4" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1.5" />
      <rect x="72" y="25" width="26" height="26" rx="2" fill="white" stroke="#D1D5DB" strokeWidth="1" />
      <line x1="76" y1="29" x2="94" y2="47" stroke="#EF4444" strokeWidth="2" />
      <line x1="94" y1="29" x2="76" y2="47" stroke="#EF4444" strokeWidth="2" />
      <text x="85" y="64" textAnchor="middle" fontSize="7" fill="#EF4444" fontWeight="600">404</text>
    </svg>
  )
}

export function AfterIllust({ className = '' }: { className?: string }) {
  return (
    <svg className={`${className}`} viewBox="0 0 120 80" fill="none">
      {/* モニタ */}
      <rect x="10" y="5" width="45" height="35" rx="3" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />
      <rect x="27" y="40" width="10" height="5" fill="#93C5FD" />
      <rect x="22" y="45" width="20" height="2" rx="1" fill="#93C5FD" />
      {/* 画面内のボタン */}
      <rect x="16" y="15" width="33" height="8" rx="2" fill="#3B82F6" />
      <text x="32.5" y="21" textAnchor="middle" fontSize="5" fill="white" fontWeight="600">URL変更</text>
      {/* 矢印 */}
      <path d="M60 25 L72 25" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowBlue)" />
      <defs><marker id="arrowBlue" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#3B82F6" /></marker></defs>
      {/* QRシール（チェック） */}
      <rect x="70" y="10" width="40" height="40" rx="4" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.5" />
      <rect x="77" y="17" width="26" height="26" rx="2" fill="white" stroke="#D1D5DB" strokeWidth="1" />
      {/* チェックマーク */}
      <circle cx="90" cy="30" r="8" fill="#22C55E" />
      <path d="M86 30 L89 33 L95 27" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="90" y="55" textAnchor="middle" fontSize="6" fill="#22C55E" fontWeight="600">OK</text>
      {/* 10秒 */}
      <text x="90" y="68" textAnchor="middle" fontSize="7" fill="#6B7280">10秒で完了</text>
    </svg>
  )
}

// 信頼バッジ
export function TrustBadges({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-8 ${className}`}>
      {[
        { icon: '🔒', label: 'SSL暗号化通信' },
        { icon: '🇯🇵', label: '国内サーバー' },
        { icon: '📊', label: 'リアルタイム解析' },
        { icon: '🕐', label: '稼働率 99.9%' },
      ].map(b => (
        <div key={b.label} className="flex items-center gap-1.5 text-white/60">
          <span className="text-sm">{b.icon}</span>
          <span className="text-[10px] font-medium">{b.label}</span>
        </div>
      ))}
    </div>
  )
}

// ステップ番号バッジ
export function StepBadge({ num, color = 'bg-blue-600' }: { num: number; color?: string }) {
  return (
    <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
      {num}
    </div>
  )
}
