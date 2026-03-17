'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, category, message }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError('送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-primary hover:underline">&larr; トップに戻る</Link>
        <h1 className="text-2xl font-bold text-foreground mt-4 mb-2">お問い合わせ</h1>
        <p className="text-sm text-muted mb-8">Pivolinkに関するご質問・ご要望をお寄せください。</p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="text-3xl mb-3">&#10003;</div>
            <h2 className="text-lg font-bold text-foreground mb-2">送信完了</h2>
            <p className="text-sm text-foreground/75">
              お問い合わせありがとうございます。内容を確認の上、ご連絡いたします。
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              トップに戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">お名前</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                placeholder="山田 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">メールアドレス</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">カテゴリ</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                <option value="general">一般的なお問い合わせ</option>
                <option value="bug">不具合の報告</option>
                <option value="feature">機能リクエスト</option>
                <option value="billing">お支払い・プランについて</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">お問い合わせ内容</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
                placeholder="お問い合わせ内容をご記入ください"
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? '送信中...' : '送信する'}
            </button>
          </form>
        )}

        <div className="mt-10 bg-card rounded-xl border border-border p-6">
          <h2 className="font-bold text-foreground mb-4">よくある質問</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-foreground">Q. 無料プランで何件まで作れますか？</p>
              <p className="text-foreground/65 mt-1">A. 無料プランでは最大5件のリダイレクトURLを作成できます。</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Q. 有料プランの解約はいつでもできますか？</p>
              <p className="text-foreground/65 mt-1">A. はい、ダッシュボードのプラン管理画面からいつでも解約可能です。解約後も当月末まで利用できます。</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Q. NFCタグはどこで購入できますか？</p>
              <p className="text-foreground/65 mt-1">A. NFCタグは市販のNTAG213/215/216対応タグをご利用ください。Amazon等で購入可能です。</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex gap-4 text-sm text-muted">
          <Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
          <Link href="/tokusho" className="hover:text-foreground transition-colors">特定商取引法</Link>
        </div>
      </div>
    </div>
  )
}
