'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewQrPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [defaultUrl, setDefaultUrl] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateSlug = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setSlug(result)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, default_url: defaultUrl, description }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || '作成に失敗しました')
      setLoading(false)
      return
    }

    router.push(`/dashboard/qr/${data.id}`)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/qr" className="text-muted hover:text-foreground text-sm flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          QRコード一覧
        </Link>
        <h1 className="text-2xl font-bold text-foreground">新規QRコード作成</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            名前 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="例: 春キャンペーンチラシ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            スラッグ <span className="text-danger">*</span>
          </label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center border border-border rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary">
              <span className="px-3 text-sm text-muted bg-gray-50 py-3 border-r border-border">/r/</span>
              <input
                type="text"
                required
                pattern="[a-zA-Z0-9_-]+"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="flex-1 px-3 py-3 outline-none"
                placeholder="campaign-spring"
              />
            </div>
            <button
              type="button"
              onClick={generateSlug}
              className="px-4 py-3 border border-border rounded-lg text-sm text-muted hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              自動生成
            </button>
          </div>
          <p className="text-xs text-muted mt-1">英数字、ハイフン、アンダースコアが使えます</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            リダイレクト先URL <span className="text-danger">*</span>
          </label>
          <input
            type="url"
            required
            value={defaultUrl}
            onChange={e => setDefaultUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="https://example.com/campaign"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            説明（任意）
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
            placeholder="このQRコードの用途や設置場所など"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '作成中...' : 'QRコードを作成'}
          </button>
          <Link
            href="/dashboard/qr"
            className="px-6 py-3 rounded-lg border border-border text-muted hover:bg-gray-50 transition-colors font-medium"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
