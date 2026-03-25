'use client'

import { useState, useEffect, useCallback } from 'react'
import { SEED_POSTS } from './seed-data'

interface XPost {
  id: string
  content: string
  category: string
  post_number: number
  hashtags: string[]
  status: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed'
  scheduled_at: string | null
  posted_at: string | null
  x_post_id: string | null
  error_message: string | null
  sort_order: number
  created_at: string
}

interface Settings {
  posts_per_day: string
  post_times: string
  timezone: string
  auto_post_enabled: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: '下書き', color: 'bg-gray-100 text-gray-700' },
  scheduled: { label: '予約済み', color: 'bg-blue-100 text-blue-700' },
  posting: { label: '投稿中', color: 'bg-yellow-100 text-yellow-700' },
  posted: { label: '投稿済み', color: 'bg-green-100 text-green-700' },
  failed: { label: '失敗', color: 'bg-red-100 text-red-700' },
}

const CATEGORY_LABELS: Record<string, string> = {
  service_intro: 'サービス紹介',
  pain_point: '課題提起・共感',
  use_case: '業種別ユースケース',
  feature_tips: '機能紹介・Tips',
  knowledge: '豆知識・教育',
  campaign: 'キャンペーン・CTA',
  engagement: '信頼構築・エンゲージメント',
  general: 'その他',
}

export default function XPostsClient() {
  const [posts, setPosts] = useState<XPost[]>([])
  const [total, setTotal] = useState(0)
  const [settings, setSettings] = useState<Settings>({
    posts_per_day: '2',
    post_times: '08:00,12:00,19:00',
    timezone: 'Asia/Tokyo',
    auto_post_enabled: 'false',
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [editingPost, setEditingPost] = useState<XPost | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), limit: '50' })
    if (filter) params.set('status', filter)
    if (categoryFilter) params.set('category', categoryFilter)

    const res = await fetch(`/api/admin/x-posts?${params}`)
    if (res.ok) {
      const data = await res.json()
      setPosts(data.posts ?? [])
      setTotal(data.total ?? 0)
      if (data.settings) setSettings(data.settings)
    }
    setLoading(false)
  }, [page, filter, categoryFilter])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  // 即時投稿
  const handlePostNow = async (id: string) => {
    if (!confirm('この投稿をXに即時投稿しますか？')) return
    setActionLoading(id)
    const res = await fetch('/api/admin/x-posts/post-now', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    setActionLoading(null)
    if (data.success) {
      showMessage('success', `投稿成功: ${data.url}`)
      fetchPosts()
    } else {
      showMessage('error', `投稿失敗: ${data.error}`)
      fetchPosts()
    }
  }

  // ステータス変更
  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/x-posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) fetchPosts()
  }

  // 投稿編集保存
  const handleSaveEdit = async () => {
    if (!editingPost) return
    const res = await fetch(`/api/admin/x-posts/${editingPost.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    })
    if (res.ok) {
      showMessage('success', '保存しました')
      setEditingPost(null)
      fetchPosts()
    } else {
      const data = await res.json()
      showMessage('error', data.error ?? '保存失敗')
    }
  }

  // 削除
  const handleDelete = async (id: string) => {
    if (!confirm('この投稿を削除しますか？')) return
    const res = await fetch(`/api/admin/x-posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showMessage('success', '削除しました')
      fetchPosts()
    }
  }

  // 一括インポート
  const handleImport = async () => {
    if (!confirm(`${SEED_POSTS.length}件の投稿をインポートしますか？`)) return
    setActionLoading('import')
    const res = await fetch('/api/admin/x-posts/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posts: SEED_POSTS }),
    })
    const data = await res.json()
    setActionLoading(null)
    if (data.success) {
      showMessage('success', `${data.imported}件インポートしました`)
      setShowImport(false)
      fetchPosts()
    } else {
      showMessage('error', data.error ?? 'インポート失敗')
    }
  }

  // 自動スケジューリング
  const handleAutoSchedule = async (days: number) => {
    if (!confirm(`${days}日分のスケジュールを自動作成しますか？`)) return
    setActionLoading('schedule')
    const res = await fetch('/api/admin/x-posts/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days }),
    })
    const data = await res.json()
    setActionLoading(null)
    if (data.success) {
      showMessage('success', data.message)
      fetchPosts()
    } else {
      showMessage('error', data.error ?? 'スケジューリング失敗')
    }
  }

  // 設定更新
  const handleSaveSettings = async () => {
    const res = await fetch('/api/admin/x-posts/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) {
      const data = await res.json()
      setSettings(data)
      showMessage('success', '設定を保存しました')
      setShowSettings(false)
    }
  }

  // 文字数カウント
  const countChars = (text: string): number => {
    let length = 0
    for (const char of text) {
      const code = char.codePointAt(0) ?? 0
      if (
        (code >= 0x1100 && code <= 0x11FF) ||
        (code >= 0x2E80 && code <= 0x9FFF) ||
        (code >= 0xAC00 && code <= 0xD7AF) ||
        (code >= 0xF900 && code <= 0xFAFF) ||
        (code >= 0xFE30 && code <= 0xFE4F) ||
        (code >= 0xFF00 && code <= 0xFFEF) ||
        (code >= 0x20000 && code <= 0x2FA1F)
      ) {
        length += 2
      } else {
        length += 1
      }
    }
    return length
  }

  const statusCounts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">X 自動投稿</h1>
          <p className="text-sm text-muted mt-1">投稿の管理・スケジュール・自動配信</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowImport(true)}
            className="px-4 py-2 text-sm bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            インポート
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 text-sm bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            設定
          </button>
          <button
            onClick={() => handleAutoSchedule(7)}
            disabled={actionLoading === 'schedule'}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'schedule' ? 'スケジューリング中...' : '7日分スケジュール'}
          </button>
        </div>
      </div>

      {/* メッセージ */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* 統計 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? '' : key)}
            className={`p-3 rounded-lg border text-center transition-colors ${
              filter === key ? 'ring-2 ring-blue-400' : ''
            } ${color.replace('text-', 'border-').replace('100', '200')} bg-white`}
          >
            <div className="text-2xl font-bold">{statusCounts[key] ?? 0}</div>
            <div className="text-xs mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${color}`}>{label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 自動投稿ステータス */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${
        settings.auto_post_enabled === 'true' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className={`w-3 h-3 rounded-full ${settings.auto_post_enabled === 'true' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span className="text-sm font-medium">
          自動投稿: {settings.auto_post_enabled === 'true' ? 'ON' : 'OFF'}
        </span>
        <span className="text-xs text-muted">
          {settings.posts_per_day}件/日 | 投稿時間: {settings.post_times}
        </span>
        <button
          onClick={() => {
            const newVal = settings.auto_post_enabled === 'true' ? 'false' : 'true'
            setSettings({ ...settings, auto_post_enabled: newVal })
            fetch('/api/admin/x-posts/settings', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ auto_post_enabled: newVal }),
            }).then(() => showMessage('success', `自動投稿を${newVal === 'true' ? 'ON' : 'OFF'}にしました`))
          }}
          className={`ml-auto px-3 py-1 text-xs rounded-lg transition-colors ${
            settings.auto_post_enabled === 'true'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {settings.auto_post_enabled === 'true' ? '停止' : '開始'}
        </button>
      </div>

      {/* フィルター */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-white"
        >
          <option value="">全カテゴリ</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="text-sm text-muted self-center">全{total}件</span>
      </div>

      {/* 投稿一覧 */}
      {loading ? (
        <div className="text-center py-12 text-muted">読み込み中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-border">
          <p className="text-muted">投稿がありません</p>
          <button
            onClick={() => setShowImport(true)}
            className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            100本の投稿をインポート
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const statusInfo = STATUS_LABELS[post.status]
            return (
              <div key={post.id} className="bg-white rounded-lg border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="text-xs text-muted font-mono w-8 shrink-0 pt-1">
                    #{post.post_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-muted">
                        {CATEGORY_LABELS[post.category] ?? post.category}
                      </span>
                      {post.scheduled_at && (
                        <span className="text-xs text-blue-600">
                          {new Date(post.scheduled_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                        </span>
                      )}
                      {post.posted_at && (
                        <span className="text-xs text-green-600">
                          投稿: {new Date(post.posted_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                        </span>
                      )}
                    </div>
                    <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{post.content}</pre>
                    {post.error_message && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                        {post.error_message}
                      </div>
                    )}
                    {post.x_post_id && (
                      <a
                        href={`https://x.com/i/status/${post.x_post_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                      >
                        Xで見る
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {post.status !== 'posted' && (
                      <>
                        <button
                          onClick={() => { setEditingPost(post); setEditContent(post.content) }}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handlePostNow(post.id)}
                          disabled={actionLoading === post.id}
                          className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === post.id ? '...' : '即時投稿'}
                        </button>
                      </>
                    )}
                    {post.status === 'failed' && (
                      <button
                        onClick={() => handleStatusChange(post.id, 'draft')}
                        className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                      >
                        リトライ
                      </button>
                    )}
                    {post.status !== 'posted' && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ページネーション */}
      {total > 50 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            前へ
          </button>
          <span className="px-4 py-2 text-sm text-muted">
            {page} / {Math.ceil(total / 50)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 50)}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            次へ
          </button>
        </div>
      )}

      {/* 編集モーダル */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">投稿 #{editingPost.post_number} を編集</h3>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={8}
              className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className={`text-xs mt-1 ${countChars(editContent) > 280 ? 'text-red-600' : 'text-muted'}`}>
              {countChars(editContent)} / 280
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={countChars(editContent) > 280}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 設定モーダル */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold">自動投稿設定</h3>

            <label className="block">
              <span className="text-sm font-medium text-foreground">1日の投稿数</span>
              <select
                value={settings.posts_per_day}
                onChange={e => setSettings({ ...settings, posts_per_day: e.target.value })}
                className="mt-1 w-full border border-border rounded-lg p-2 text-sm"
              >
                {[1, 2, 3].map(n => (
                  <option key={n} value={n}>{n}件/日</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">投稿時間（JST、カンマ区切り）</span>
              <input
                type="text"
                value={settings.post_times}
                onChange={e => setSettings({ ...settings, post_times: e.target.value })}
                placeholder="08:00,12:00,19:00"
                className="mt-1 w-full border border-border rounded-lg p-2 text-sm"
              />
              <p className="text-xs text-muted mt-1">例: 08:00,12:00,19:00</p>
            </label>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* インポートモーダル */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2">投稿データのインポート</h3>
            <p className="text-sm text-muted mb-4">
              事前に作成した100本のPivolink販促投稿をインポートします。
              全てdraft（下書き）状態で登録されます。
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
              <div>インポート件数: <strong>{SEED_POSTS.length}件</strong></div>
              <div className="mt-1 text-xs text-muted">
                カテゴリ: サービス紹介 / 課題提起 / ユースケース / 機能Tips / 豆知識 / CTA / エンゲージメント
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleImport}
                disabled={actionLoading === 'import'}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === 'import' ? 'インポート中...' : 'インポート実行'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
