'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AdminUser } from '@/types/database'

type AdminTab = 'users' | 'contacts' | 'feedbacks'

interface Stats {
  total_users: number
  total_qr_codes: number
  total_scans: number
  recent_scans_7d: number
  recent_users_7d: number
}

interface FeedbackItem {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  status: string
  admin_note: string | null
  created_at: string
}

interface ContactMessage {
  id: string
  name: string
  email: string
  category: string
  message: string
  is_read: boolean
  note: string | null
  created_at: string
}

export default function AdminClient({ currentUserId }: { currentUserId: string }) {
  const [tab, setTab] = useState<AdminTab>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const [usersRes, statsRes, contactsRes, feedbacksRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/stats'),
      fetch('/api/admin/contacts'),
      fetch('/api/admin/feedbacks'),
    ])
    if (usersRes.ok) setUsers(await usersRes.json())
    if (statsRes.ok) setStats(await statsRes.json())
    if (contactsRes.ok) setContacts(await contactsRes.json())
    if (feedbacksRes.ok) setFeedbacks(await feedbacksRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const updateUser = async (id: string, updates: Record<string, unknown>) => {
    setActionLoading(id)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) await fetchData()
    setActionLoading(null)
  }

  const deleteUser = async (id: string) => {
    setActionLoading(id)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) await fetchData()
    setActionLoading(null)
    setConfirmDelete(null)
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">管理者パネル</h1>
        <p className="text-muted text-sm mt-1">ユーザー管理・サービス全体の統計</p>
      </div>

      {/* タブ */}
      <div className="flex gap-1 border-b border-border mb-6">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          ユーザー管理
        </button>
        <button
          onClick={() => setTab('contacts')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'contacts' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          お問い合わせ
          {contacts.filter(c => !c.is_read).length > 0 && (
            <span className="bg-danger text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
              {contacts.filter(c => !c.is_read).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('feedbacks')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'feedbacks' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          フィードバック
          {feedbacks.filter(f => f.status === 'new').length > 0 && (
            <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
              {feedbacks.filter(f => f.status === 'new').length}
            </span>
          )}
        </button>
      </div>

      {tab === 'feedbacks' && (
        <FeedbacksSection feedbacks={feedbacks} onUpdate={fetchData} />
      )}

      {tab === 'contacts' && (
        <ContactsSection contacts={contacts} onUpdate={fetchData} />
      )}

      {tab === 'users' && <>
      {/* 統計カード */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="総ユーザー数" value={stats.total_users} sub={`+${stats.recent_users_7d} (7日間)`} />
          <StatCard label="総QR/NFC数" value={stats.total_qr_codes} />
          <StatCard label="総スキャン数" value={stats.total_scans} sub={`+${stats.recent_scans_7d} (7日間)`} />
          <StatCard label="直近7日スキャン" value={stats.recent_scans_7d} />
          <StatCard label="新規ユーザー(7日)" value={stats.recent_users_7d} />
        </div>
      )}

      {/* ユーザー一覧 */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground">ユーザー一覧</h2>
          <span className="text-sm text-muted">{users.length} 件</span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 sm:px-6 py-3 font-medium">ユーザー</th>
                <th className="px-4 sm:px-6 py-3 font-medium">ロール</th>
                <th className="px-4 sm:px-6 py-3 font-medium">QR/NFC数</th>
                <th className="px-4 sm:px-6 py-3 font-medium">登録日</th>
                <th className="px-4 sm:px-6 py-3 font-medium">最終ログイン</th>
                <th className="px-4 sm:px-6 py-3 font-medium">状態</th>
                <th className="px-4 sm:px-6 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="font-medium text-foreground">
                      {u.profile?.display_name || u.email.split('@')[0]}
                    </div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.profile?.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.profile?.role === 'admin' ? '管理者' : 'ユーザー'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">{u.qr_count}</td>
                  <td className="px-6 py-4 text-muted">
                    {new Date(u.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString('ja-JP')
                      : '-'}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    {u.profile?.is_banned ? (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">BAN</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">有効</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    {u.id === currentUserId ? (
                      <span className="text-xs text-muted">自分</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {actionLoading === u.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        ) : (
                          <>
                            {/* ロール切替 */}
                            <button
                              onClick={() => updateUser(u.id, {
                                role: u.profile?.role === 'admin' ? 'user' : 'admin'
                              })}
                              className="text-xs px-2 py-1 rounded border border-border hover:bg-gray-100 transition-colors"
                              title={u.profile?.role === 'admin' ? 'ユーザーに降格' : '管理者に昇格'}
                            >
                              {u.profile?.role === 'admin' ? '降格' : '昇格'}
                            </button>

                            {/* BAN切替 */}
                            <button
                              onClick={() => updateUser(u.id, {
                                is_banned: !u.profile?.is_banned
                              })}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${
                                u.profile?.is_banned
                                  ? 'border-green-300 text-green-700 hover:bg-green-50'
                                  : 'border-orange-300 text-orange-700 hover:bg-orange-50'
                              }`}
                            >
                              {u.profile?.is_banned ? '解除' : 'BAN'}
                            </button>

                            {/* 削除 */}
                            {confirmDelete === u.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  className="text-xs px-2 py-1 rounded bg-danger text-white hover:opacity-80 transition-opacity"
                                >
                                  確定
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="text-xs px-2 py-1 rounded border border-border hover:bg-gray-100 transition-colors"
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(u.id)}
                                className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                              >
                                削除
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>}
    </div>
  )
}

function ContactsSection({ contacts, onUpdate }: { contacts: ContactMessage[]; onUpdate: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleRead = async (id: string, currentRead: boolean) => {
    await fetch('/api/admin/contacts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_read: !currentRead }),
    })
    onUpdate()
  }

  const unreadCount = contacts.filter(c => !c.is_read).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-muted">{contacts.length} 件（未読 {unreadCount} 件）</span>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted">
          お問い合わせはまだありません
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map(c => (
            <div
              key={c.id}
              className={`bg-card rounded-xl border border-border overflow-hidden ${!c.is_read ? 'border-l-4 border-l-primary' : ''}`}
            >
              <button
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {!c.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    <div className="min-w-0">
                      <div className="font-medium text-foreground text-sm">{c.name}</div>
                      <div className="text-xs text-muted truncate">{c.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{c.category}</span>
                    <span className="text-xs text-muted">
                      {new Date(c.created_at).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <svg className={`w-4 h-4 text-muted transition-transform ${expandedId === c.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {expandedId === c.id && (
                <div className="px-4 pb-4 border-t border-border pt-4">
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed mb-4">{c.message}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleRead(c.id, c.is_read)}
                      className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                        c.is_read
                          ? 'border-border text-muted hover:bg-gray-100'
                          : 'border-primary text-primary hover:bg-green-50'
                      }`}
                    >
                      {c.is_read ? '未読に戻す' : '既読にする'}
                    </button>
                    <a
                      href={`mailto:${c.email}`}
                      className="text-xs px-3 py-1.5 rounded border border-border text-muted hover:bg-gray-100 transition-colors"
                    >
                      返信メール
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const fbTypeLabel: Record<string, string> = {
  improvement: '改善要望',
  feature: '新機能',
  bug: '不具合',
  other: 'その他',
}

const fbStatusOptions = [
  { value: 'new', label: '受付済み', className: 'bg-blue-100 text-blue-700' },
  { value: 'reviewing', label: '検討中', className: 'bg-yellow-100 text-yellow-700' },
  { value: 'planned', label: '対応予定', className: 'bg-green-100 text-green-700' },
  { value: 'done', label: '対応済み', className: 'bg-gray-100 text-gray-600' },
  { value: 'declined', label: '見送り', className: 'bg-red-100 text-red-600' },
]

function FeedbacksSection({ feedbacks, onUpdate }: { feedbacks: FeedbackItem[]; onUpdate: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/feedbacks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    onUpdate()
  }

  const newCount = feedbacks.filter(f => f.status === 'new').length

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-muted">{feedbacks.length} 件（新着 {newCount} 件）</span>
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted">
          フィードバックはまだありません
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map(fb => {
            const st = fbStatusOptions.find(s => s.value === fb.status) || fbStatusOptions[0]
            return (
              <div
                key={fb.id}
                className={`bg-card rounded-xl border border-border overflow-hidden ${fb.status === 'new' ? 'border-l-4 border-l-blue-400' : ''}`}
              >
                <button
                  onClick={() => setExpandedId(expandedId === fb.id ? null : fb.id)}
                  className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 shrink-0">
                        {fbTypeLabel[fb.type] || fb.type}
                      </span>
                      <span className="font-medium text-foreground text-sm truncate">{fb.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${st.className}`}>{st.label}</span>
                      <span className="text-xs text-muted">
                        {new Date(fb.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      <svg className={`w-4 h-4 text-muted transition-transform ${expandedId === fb.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {expandedId === fb.id && (
                  <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{fb.body}</p>
                    <div className="text-xs text-muted">User ID: {fb.user_id}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      {fbStatusOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateStatus(fb.id, opt.value)}
                          className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                            fb.status === opt.value
                              ? opt.className + ' border-transparent font-medium'
                              : 'border-border text-muted hover:bg-gray-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="text-sm text-muted mb-1">{label}</div>
      <div className="text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
      {sub && <div className="text-xs text-success mt-1">{sub}</div>}
    </div>
  )
}
