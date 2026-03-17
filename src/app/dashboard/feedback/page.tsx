'use client'

import { useState, useEffect, useCallback } from 'react'

interface Feedback {
  id: string
  type: string
  title: string
  body: string
  status: string
  created_at: string
}

const typeOptions = [
  { value: 'improvement', label: '改善要望' },
  { value: 'feature', label: '新機能リクエスト' },
  { value: 'bug', label: '不具合報告' },
  { value: 'other', label: 'その他' },
]

const statusLabel: Record<string, { text: string; className: string }> = {
  new: { text: '受付済み', className: 'bg-blue-100 text-blue-700' },
  reviewing: { text: '検討中', className: 'bg-yellow-100 text-yellow-700' },
  planned: { text: '対応予定', className: 'bg-green-100 text-green-700' },
  done: { text: '対応済み', className: 'bg-gray-100 text-gray-600' },
  declined: { text: '見送り', className: 'bg-red-100 text-red-600' },
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('improvement')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const fetchFeedbacks = useCallback(async () => {
    const res = await fetch('/api/feedback')
    if (res.ok) setFeedbacks(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchFeedbacks() }, [fetchFeedbacks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title, body }),
    })
    if (res.ok) {
      setTitle('')
      setBody('')
      setType('improvement')
      setShowForm(false)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
      fetchFeedbacks()
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">フィードバック</h1>
          <p className="text-muted text-sm mt-1">改善要望や新機能リクエストをお寄せください</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          投稿する
        </button>
      </div>

      {submitted && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-6">
          フィードバックを送信しました。ご協力ありがとうございます！
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-4 sm:p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">種別</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                {typeOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">タイトル</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                placeholder="例: CSVエクスポート機能がほしい"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">詳細</label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
              placeholder="どのような場面で必要か、どう改善されると嬉しいかなど、自由にお書きください"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submitting ? '送信中...' : '送信'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 border border-border rounded-lg text-sm text-muted hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {feedbacks.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-muted mb-4">まだフィードバックはありません</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            最初のフィードバックを投稿する
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map(fb => {
            const s = statusLabel[fb.status] || statusLabel.new
            const t = typeOptions.find(o => o.value === fb.type)
            return (
              <div key={fb.id} className="bg-card rounded-xl border border-border p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {t?.label || fb.type}
                    </span>
                    <h3 className="font-medium text-foreground text-sm">{fb.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.className}`}>{s.text}</span>
                    <span className="text-xs text-muted">
                      {new Date(fb.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">{fb.body}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
