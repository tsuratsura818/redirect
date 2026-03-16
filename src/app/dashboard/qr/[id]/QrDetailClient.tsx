'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { QrCode, RedirectRule, RedirectHistory, CushionPage, ConditionType } from '@/types/database'
import { format } from 'date-fns'
import AnalyticsTab from './AnalyticsTab'

type Tab = 'overview' | 'rules' | 'analytics' | 'cushion' | 'history'

interface Props {
  qrCode: QrCode
}

export default function QrDetailClient({ qrCode: initialQr }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [qr, setQr] = useState(initialQr)
  const [rules, setRules] = useState<RedirectRule[]>([])
  const [history, setHistory] = useState<RedirectHistory[]>([])
  const [cushion, setCushion] = useState<CushionPage | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 編集フォーム
  const [editName, setEditName] = useState(qr.name)
  const [editUrl, setEditUrl] = useState(qr.default_url)
  const [editDesc, setEditDesc] = useState(qr.description || '')
  const [editActive, setEditActive] = useState(qr.is_active)
  const [editExpires, setEditExpires] = useState(qr.expires_at ? qr.expires_at.split('T')[0] : '')
  const [editFallback, setEditFallback] = useState(qr.fallback_url || '')

  const loadRules = useCallback(async () => {
    const res = await fetch(`/api/qr/${qr.id}/rules`)
    if (res.ok) setRules(await res.json())
  }, [qr.id])

  const loadHistory = useCallback(async () => {
    const res = await fetch(`/api/qr/${qr.id}/history`)
    if (res.ok) setHistory(await res.json())
  }, [qr.id])

  const loadCushion = useCallback(async () => {
    const res = await fetch(`/api/qr/${qr.id}/cushion`)
    if (res.ok) {
      const data = await res.json()
      setCushion(data)
    }
  }, [qr.id])

  useEffect(() => {
    loadRules()
    loadHistory()
    loadCushion()
  }, [loadRules, loadHistory, loadCushion])

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch(`/api/qr/${qr.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName,
        default_url: editUrl,
        description: editDesc || null,
        is_active: editActive,
        expires_at: editExpires ? new Date(editExpires).toISOString() : null,
        fallback_url: editFallback || null,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setQr(data)
      showMessage('保存しました')
      loadHistory()
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('このQRコードを削除しますか？この操作は元に戻せません。')) return
    await fetch(`/api/qr/${qr.id}`, { method: 'DELETE' })
    router.push('/dashboard/qr')
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const redirectUrl = `${baseUrl}/r/${qr.slug}`

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: '概要' },
    { key: 'rules', label: 'ルール' },
    { key: 'analytics', label: 'アナリティクス' },
    { key: 'cushion', label: 'クッションページ' },
    { key: 'history', label: '変更履歴' },
  ]

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{qr.name}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              qr.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {qr.is_active ? 'アクティブ' : '停止中'}
            </span>
          </div>
          <p className="text-sm text-muted mt-1">{redirectUrl}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/qr/${qr.id}/qrcode?format=png&size=400&baseUrl=${encodeURIComponent(baseUrl)}`}
            download={`qr-${qr.slug}.png`}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
          >
            PNG
          </a>
          <a
            href={`/api/qr/${qr.id}/qrcode?format=svg&size=400&baseUrl=${encodeURIComponent(baseUrl)}`}
            download={`qr-${qr.slug}.svg`}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
          >
            SVG
          </a>
        </div>
      </div>

      {/* QRコードプレビュー */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6 flex items-center gap-8">
        <div className="bg-white p-4 rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr/${qr.id}/qrcode?format=svg&size=200&baseUrl=${encodeURIComponent(baseUrl)}`}
            alt="QR Code"
            width={160}
            height={160}
          />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted">スラッグ</span>
              <p className="font-medium text-foreground">/r/{qr.slug}</p>
            </div>
            <div>
              <span className="text-muted">スキャン数</span>
              <p className="font-medium text-foreground">{qr.scan_count.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted">デフォルトURL</span>
              <p className="font-medium text-foreground truncate">{qr.default_url}</p>
            </div>
            <div>
              <span className="text-muted">作成日</span>
              <p className="font-medium text-foreground">{format(new Date(qr.created_at), 'yyyy/MM/dd HH:mm')}</p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-6">{message}</div>
      )}

      {/* タブ */}
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 概要タブ */}
      {tab === 'overview' && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">名前</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">ステータス</label>
              <select
                value={editActive ? 'active' : 'inactive'}
                onChange={e => setEditActive(e.target.value === 'active')}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="active">アクティブ</option>
                <option value="inactive">停止中</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">デフォルトURL</label>
            <input
              type="url"
              value={editUrl}
              onChange={e => setEditUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">説明</label>
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">有効期限（任意）</label>
              <input
                type="date"
                value={editExpires}
                onChange={e => setEditExpires(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">期限切れ時URL（任意）</label>
              <input
                type="url"
                value={editFallback}
                onChange={e => setEditFallback(e.target.value)}
                placeholder="https://example.com/expired"
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm text-danger hover:bg-red-50 rounded-lg transition-colors"
            >
              QRコードを削除
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
            >
              {loading ? '保存中...' : '変更を保存'}
            </button>
          </div>
        </div>
      )}

      {/* ルールタブ */}
      {tab === 'rules' && (
        <RulesTab qrId={qr.id} rules={rules} onUpdate={loadRules} />
      )}

      {/* アナリティクスタブ */}
      {tab === 'analytics' && (
        <AnalyticsTab qrId={qr.id} />
      )}

      {/* クッションページタブ */}
      {tab === 'cushion' && (
        <CushionTab qrId={qr.id} cushion={cushion} onUpdate={loadCushion} />
      )}

      {/* 変更履歴タブ */}
      {tab === 'history' && (
        <HistoryTab history={history} />
      )}
    </div>
  )
}

// ルール管理
function RulesTab({ qrId, rules, onUpdate }: { qrId: string; rules: RedirectRule[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [priority, setPriority] = useState(0)
  const [condType, setCondType] = useState<ConditionType>('default')
  const [scheduleStart, setScheduleStart] = useState('')
  const [scheduleEnd, setScheduleEnd] = useState('')
  const [device, setDevice] = useState<'ios' | 'android' | 'desktop'>('ios')
  const [abWeight, setAbWeight] = useState(50)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    let condition_value = {}
    if (condType === 'schedule') condition_value = { start_at: new Date(scheduleStart).toISOString(), end_at: new Date(scheduleEnd).toISOString() }
    if (condType === 'device') condition_value = { device }
    if (condType === 'ab_test') condition_value = { weight: abWeight }

    await fetch(`/api/qr/${qrId}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, destination_url: url, priority, condition_type: condType, condition_value }),
    })

    setShowForm(false)
    setName('')
    setUrl('')
    setPriority(0)
    setCondType('default')
    setLoading(false)
    onUpdate()
  }

  const handleToggle = async (rule: RedirectRule) => {
    await fetch(`/api/qr/${qrId}/rules/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !rule.is_active }),
    })
    onUpdate()
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('このルールを削除しますか？')) return
    await fetch(`/api/qr/${qrId}/rules/${ruleId}`, { method: 'DELETE' })
    onUpdate()
  }

  const condTypeLabel: Record<ConditionType, string> = {
    default: 'デフォルト',
    schedule: 'スケジュール',
    device: 'デバイス',
    ab_test: 'A/Bテスト',
  }

  const condTypeColor: Record<ConditionType, string> = {
    default: 'bg-gray-100 text-gray-700',
    schedule: 'bg-blue-100 text-blue-700',
    device: 'bg-purple-100 text-purple-700',
    ab_test: 'bg-orange-100 text-orange-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">優先度が高いルールから順に評価されます</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          ルール追加
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">ルール名</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                placeholder="例: iOSユーザー向け"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">条件タイプ</label>
              <select
                value={condType}
                onChange={e => setCondType(e.target.value as ConditionType)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                <option value="default">デフォルト</option>
                <option value="schedule">スケジュール</option>
                <option value="device">デバイス</option>
                <option value="ab_test">A/Bテスト</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">リダイレクト先URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
              placeholder="https://example.com"
            />
          </div>

          {condType === 'schedule' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">開始日時</label>
                <input
                  type="datetime-local"
                  value={scheduleStart}
                  onChange={e => setScheduleStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">終了日時</label>
                <input
                  type="datetime-local"
                  value={scheduleEnd}
                  onChange={e => setScheduleEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
                />
              </div>
            </div>
          )}

          {condType === 'device' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">対象デバイス</label>
              <select
                value={device}
                onChange={e => setDevice(e.target.value as 'ios' | 'android' | 'desktop')}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
              >
                <option value="ios">iOS (iPhone/iPad)</option>
                <option value="android">Android</option>
                <option value="desktop">デスクトップ</option>
              </select>
            </div>
          )}

          {condType === 'ab_test' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                トラフィック配分: {abWeight}%
              </label>
              <input
                type="range"
                min="1"
                max="99"
                value={abWeight}
                onChange={e => setAbWeight(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">優先度（大きいほど優先）</label>
            <input
              type="number"
              value={priority}
              onChange={e => setPriority(parseInt(e.target.value) || 0)}
              className="w-32 px-3 py-2 rounded-lg border border-border bg-white text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={loading || !name || !url}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              追加
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-border rounded-lg text-sm text-muted"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted">
            ルールがありません。デフォルトURLにリダイレクトされます。
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className={`bg-card rounded-xl border border-border p-4 ${!rule.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${condTypeColor[rule.condition_type]}`}>
                    {condTypeLabel[rule.condition_type]}
                  </span>
                  <div>
                    <div className="font-medium text-foreground text-sm">{rule.name}</div>
                    <div className="text-xs text-muted truncate max-w-md">{rule.destination_url}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">優先度: {rule.priority}</span>
                  <button
                    onClick={() => handleToggle(rule)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      rule.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {rule.is_active ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1 text-muted hover:text-danger transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {rule.condition_type === 'schedule' && (
                <div className="mt-2 text-xs text-muted">
                  期間: {format(new Date((rule.condition_value as { start_at: string }).start_at), 'yyyy/MM/dd HH:mm')} 〜{' '}
                  {format(new Date((rule.condition_value as { end_at: string }).end_at), 'yyyy/MM/dd HH:mm')}
                </div>
              )}
              {rule.condition_type === 'device' && (
                <div className="mt-2 text-xs text-muted">
                  対象: {(rule.condition_value as { device: string }).device.toUpperCase()}
                </div>
              )}
              {rule.condition_type === 'ab_test' && (
                <div className="mt-2 text-xs text-muted">
                  配分: {(rule.condition_value as { weight: number }).weight}%
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// クッションページ
function CushionTab({ qrId, cushion, onUpdate }: { qrId: string; cushion: CushionPage | null; onUpdate: () => void }) {
  const [isActive, setIsActive] = useState(cushion?.is_active ?? false)
  const [title, setTitle] = useState(cushion?.title ?? 'リダイレクト中...')
  const [msg, setMsg] = useState(cushion?.message ?? '')
  const [btnText, setBtnText] = useState(cushion?.button_text ?? '続ける')
  const [bgColor, setBgColor] = useState(cushion?.background_color ?? '#ffffff')
  const [textColor, setTextColor] = useState(cushion?.text_color ?? '#000000')
  const [accentColor, setAccentColor] = useState(cushion?.accent_color ?? '#3b82f6')
  const [seconds, setSeconds] = useState(cushion?.display_seconds ?? 5)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await fetch(`/api/qr/${qrId}/cushion`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_active: isActive,
        title,
        message: msg || null,
        button_text: btnText,
        background_color: bgColor,
        text_color: textColor,
        accent_color: accentColor,
        display_seconds: seconds,
      }),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    onUpdate()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">クッションページ設定</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm">有効にする</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">メッセージ</label>
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm resize-none"
            placeholder="お知らせやクーポン情報など"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">ボタンテキスト</label>
            <input
              type="text"
              value={btnText}
              onChange={e => setBtnText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">表示秒数</label>
            <input
              type="number"
              min={1}
              max={30}
              value={seconds}
              onChange={e => setSeconds(parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">背景色</label>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 rounded border border-border cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">文字色</label>
            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded border border-border cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">アクセント色</label>
            <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-full h-10 rounded border border-border cursor-pointer" />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? '保存中...' : saved ? '保存しました' : '保存'}
        </button>
      </div>

      {/* プレビュー */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-bold text-foreground mb-4">プレビュー</h3>
        <div
          className="rounded-xl p-8 flex items-center justify-center min-h-[300px]"
          style={{ backgroundColor: bgColor }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <h2 className="text-lg font-bold mb-2" style={{ color: textColor }}>{title}</h2>
            {msg && <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7 }}>{msg}</p>}
            <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.5 }}>{seconds}秒後に自動的に移動します</p>
            <button
              className="w-full py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: accentColor }}
            >
              {btnText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 変更履歴
function HistoryTab({ history }: { history: RedirectHistory[] }) {
  const actionLabel: Record<string, string> = {
    create: '作成',
    update: '更新',
    delete: '削除',
  }
  const actionColor: Record<string, string> = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      {history.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted">
          変更履歴はまだありません
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(h => (
            <div key={h.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColor[h.action] || ''}`}>
                  {actionLabel[h.action] || h.action}
                </span>
                <span className="text-sm text-muted">
                  {format(new Date(h.created_at), 'yyyy/MM/dd HH:mm:ss')}
                </span>
              </div>
              <pre className="text-xs text-muted bg-gray-50 p-3 rounded-lg overflow-auto max-h-40">
                {JSON.stringify(h.changes, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
