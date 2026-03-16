'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

interface AnalyticsData {
  total: number
  daily: { date: string; count: number }[]
  devices: { device_type: string; count: number }[]
  os: { os: string; count: number }[]
  browsers: { browser: string; count: number }[]
  destinations: { url: string; count: number }[]
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#64748b']

const deviceLabels: Record<string, string> = {
  mobile: 'モバイル',
  tablet: 'タブレット',
  desktop: 'デスクトップ',
  unknown: '不明',
}

export default function AnalyticsTab({ qrId }: { qrId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/qr/${qrId}/analytics?days=${days}`)
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [qrId, days])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* 期間選択 */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-foreground">
          合計 <span className="text-primary">{data.total.toLocaleString()}</span> スキャン
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* 日別グラフ */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-bold text-foreground mb-4">日別スキャン数</h3>
        {data.daily.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={v => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={v => v as string}
                formatter={(value) => [value, 'スキャン数']}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted">
            データがありません
          </div>
        )}
      </div>

      {/* デバイス & OS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-bold text-foreground mb-4">デバイス</h3>
          {data.devices.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.devices.map(d => ({
                    ...d,
                    name: deviceLabels[d.device_type] || d.device_type,
                  }))}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {data.devices.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted">データなし</div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-bold text-foreground mb-4">OS</h3>
          {data.os.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.os}
                  dataKey="count"
                  nameKey="os"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {data.os.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted">データなし</div>
          )}
        </div>
      </div>

      {/* ブラウザ & リダイレクト先 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-bold text-foreground mb-4">ブラウザ</h3>
          {data.browsers.length > 0 ? (
            <div className="space-y-2">
              {data.browsers.slice(0, 8).map((b, i) => (
                <div key={b.browser} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="flex-1 text-sm text-foreground">{b.browser}</span>
                  <span className="text-sm font-medium text-foreground">{b.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted text-center py-8">データなし</div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-bold text-foreground mb-4">リダイレクト先URL</h3>
          {data.destinations.length > 0 ? (
            <div className="space-y-2">
              {data.destinations.slice(0, 8).map(d => (
                <div key={d.url} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-foreground truncate">{d.url}</span>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted text-center py-8">データなし</div>
          )}
        </div>
      </div>
    </div>
  )
}
