'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

interface Summary {
  period_days: number
  total_qr: number
  active_qr: number
  total_scans_all_time: number
  total_scans_period: number
  daily: { date: string; count: number }[]
  devices: { device_type: string; count: number }[]
  os: { os: string; count: number }[]
  browsers: { browser: string; count: number }[]
  per_qr: {
    id: string
    slug: string
    name: string
    default_url: string
    is_active: boolean
    total_scans_all_time: number
    scans_in_period: number
    created_at: string
  }[]
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#64748b']

const deviceLabels: Record<string, string> = {
  mobile: 'モバイル',
  tablet: 'タブレット',
  desktop: 'デスクトップ',
  unknown: '不明',
}

interface Props {
  userEmail: string
  displayName: string
}

export default function ReportClient({ userEmail, displayName }: Props) {
  const [data, setData] = useState<Summary | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [generatedAt] = useState(() => new Date())

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/summary?days=${days}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [days])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 操作バー (印刷時は非表示) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">← ダッシュボードに戻る</Link>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-1">アクセス解析レポート</h1>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === d ? 'bg-primary text-white' : 'bg-gray-100 text-muted hover:bg-gray-200'
              }`}
            >
              {d}日間
            </button>
          ))}
          <button
            onClick={() => window.print()}
            className="ml-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            印刷 / PDF として保存
          </button>
        </div>
      </div>

      {/* 印刷時のヘッダー */}
      <div className="hidden print:block border-b border-border pb-4 mb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xl font-bold">Pivolink — アクセス解析レポート</div>
            <div className="text-xs text-muted mt-1">{displayName} ({userEmail})</div>
          </div>
          <div className="text-xs text-muted text-right">
            <div>期間: 直近 {data.period_days} 日間</div>
            <div>出力日時: {generatedAt.toLocaleString('ja-JP')}</div>
          </div>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print-keep-together">
        <SummaryCard label="登録 QR/NFC 数" value={data.total_qr} sub={`有効 ${data.active_qr} 件`} />
        <SummaryCard label="累計スキャン" value={data.total_scans_all_time} sub="全期間" />
        <SummaryCard label="期間内スキャン" value={data.total_scans_period} sub={`直近 ${data.period_days} 日間`} />
        <SummaryCard
          label="1日平均スキャン"
          value={data.period_days > 0 ? Math.round(data.total_scans_period / data.period_days) : 0}
          sub="期間内平均"
        />
      </div>

      {/* 日別グラフ */}
      <div className="bg-card rounded-xl border border-border p-6 print-keep-together">
        <h3 className="font-bold text-foreground mb-4">日別スキャン数</h3>
        {data.daily.length > 0 && data.daily.some(d => d.count > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'スキャン数']} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted">期間内のスキャンはありません</div>
        )}
      </div>

      {/* デバイス & OS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 print-keep-together">
          <h3 className="font-bold text-foreground mb-4">デバイス内訳</h3>
          {data.devices.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.devices.map(d => ({ ...d, name: deviceLabels[d.device_type] || d.device_type }))}
                  dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {data.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[240px] flex items-center justify-center text-muted">データなし</div>}
        </div>

        <div className="bg-card rounded-xl border border-border p-6 print-keep-together">
          <h3 className="font-bold text-foreground mb-4">OS 内訳</h3>
          {data.os.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.os} dataKey="count" nameKey="os" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {data.os.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[240px] flex items-center justify-center text-muted">データなし</div>}
        </div>
      </div>

      {/* ブラウザ */}
      <div className="bg-card rounded-xl border border-border p-6 print-keep-together">
        <h3 className="font-bold text-foreground mb-4">ブラウザ別</h3>
        {data.browsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {data.browsers.slice(0, 12).map((b, i) => (
              <div key={b.browser} className="flex items-center gap-3 py-1">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="flex-1 text-sm text-foreground truncate">{b.browser}</span>
                <span className="text-sm font-medium text-foreground">{b.count}</span>
              </div>
            ))}
          </div>
        ) : <div className="text-muted text-center py-6">データなし</div>}
      </div>

      {/* QR ごとの集計 */}
      <div className="bg-card rounded-xl border border-border print-break-before">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">QR/NFC 別スキャン数</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 sm:px-6 py-3 font-medium">名称 / slug</th>
                <th className="px-4 sm:px-6 py-3 font-medium">リダイレクト先</th>
                <th className="px-4 sm:px-6 py-3 font-medium text-right">期間内</th>
                <th className="px-4 sm:px-6 py-3 font-medium text-right">累計</th>
                <th className="px-4 sm:px-6 py-3 font-medium">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.per_qr.map(q => (
                <tr key={q.id}>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="font-medium text-foreground">{q.name}</div>
                    <div className="text-xs text-muted">/r/{q.slug}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-xs text-muted">
                    <div className="truncate max-w-[300px]">{q.default_url}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right font-medium">{q.scans_in_period.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-3 text-right text-muted">{q.total_scans_all_time.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      q.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {q.is_active ? '有効' : '停止'}
                    </span>
                  </td>
                </tr>
              ))}
              {data.per_qr.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">QR/NFC がまだ登録されていません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 印刷時フッター */}
      <div className="hidden print:block text-xs text-muted text-center pt-4">
        Pivolink — QR / NFC リダイレクト管理 — https://redirect.tsuratsura.com
      </div>
    </div>
  )
}

function SummaryCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="text-sm text-muted mb-1">{label}</div>
      <div className="text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  )
}
