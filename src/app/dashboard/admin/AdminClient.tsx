'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AdminUser } from '@/types/database'

interface Stats {
  total_users: number
  total_qr_codes: number
  total_scans: number
  recent_scans_7d: number
  recent_users_7d: number
}

export default function AdminClient({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const [usersRes, statsRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/stats'),
    ])
    if (usersRes.ok) setUsers(await usersRes.json())
    if (statsRes.ok) setStats(await statsRes.json())
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">管理者パネル</h1>
        <p className="text-muted text-sm mt-1">ユーザー管理・サービス全体の統計</p>
      </div>

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
