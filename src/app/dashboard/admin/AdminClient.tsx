'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AdminUser } from '@/types/database'

type AdminTab = 'users' | 'contacts' | 'feedbacks' | 'business' | 'coupons' | 'affiliates' | 'settings'

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

interface BusinessMetrics {
  planCounts: { free: number; pro: number; business: number }
  paidActive: number
  cancelPending: number
  totalUsers: number
  mrr: number
  arr: number
  conversionRate: number
  churnRate: number
  arpu: number
  ltv: number
  breakevenUsers: number
  breakevenProgress: number
  fixedCosts: { vercel: number; supabase: number; misc: number; total: number }
  monthlyGrowth: { month: string; users: number; paid: number; cumulative: number }[]
  profitLoss: number
}

export default function AdminClient({ currentUserId }: { currentUserId: string }) {
  const [tab, setTab] = useState<AdminTab>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [business, setBusiness] = useState<BusinessMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const [usersRes, statsRes, contactsRes, feedbacksRes, bizRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/stats'),
      fetch('/api/admin/contacts'),
      fetch('/api/admin/feedbacks'),
      fetch('/api/admin/business-metrics'),
    ])
    if (usersRes.ok) setUsers(await usersRes.json())
    if (statsRes.ok) setStats(await statsRes.json())
    if (contactsRes.ok) setContacts(await contactsRes.json())
    if (feedbacksRes.ok) setFeedbacks(await feedbacksRes.json())
    if (bizRes.ok) setBusiness(await bizRes.json())
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
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        <TabButton active={tab === 'users'} onClick={() => setTab('users')}>ユーザー管理</TabButton>
        <TabButton active={tab === 'business'} onClick={() => setTab('business')}>
          経営ダッシュボード
        </TabButton>
        <TabButton active={tab === 'contacts'} onClick={() => setTab('contacts')} badge={contacts.filter(c => !c.is_read).length}>
          お問い合わせ
        </TabButton>
        <TabButton active={tab === 'feedbacks'} onClick={() => setTab('feedbacks')} badge={feedbacks.filter(f => f.status === 'new').length}>
          フィードバック
        </TabButton>
        <TabButton active={tab === 'coupons'} onClick={() => setTab('coupons')}>
          クーポン
        </TabButton>
        <TabButton active={tab === 'affiliates'} onClick={() => setTab('affiliates')}>
          アフィリエイト
        </TabButton>
        <TabButton active={tab === 'settings'} onClick={() => setTab('settings')}>
          サイト設定
        </TabButton>
      </div>

      {tab === 'feedbacks' && (
        <FeedbacksSection feedbacks={feedbacks} onUpdate={fetchData} />
      )}

      {tab === 'contacts' && (
        <ContactsSection contacts={contacts} onUpdate={fetchData} />
      )}

      {tab === 'business' && business && (
        <BusinessDashboard metrics={business} />
      )}

      {tab === 'settings' && (
        <SiteSettings />
      )}

      {tab === 'coupons' && (
        <CouponsSection />
      )}

      {tab === 'affiliates' && (
        <AffiliatesSection currentUserId={currentUserId} />
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
                            <button
                              onClick={() => updateUser(u.id, {
                                role: u.profile?.role === 'admin' ? 'user' : 'admin'
                              })}
                              className="text-xs px-2 py-1 rounded border border-border hover:bg-gray-100 transition-colors"
                              title={u.profile?.role === 'admin' ? 'ユーザーに降格' : '管理者に昇格'}
                            >
                              {u.profile?.role === 'admin' ? '降格' : '昇格'}
                            </button>
                            <button
                              onClick={() => updateUser(u.id, { is_banned: !u.profile?.is_banned })}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${
                                u.profile?.is_banned
                                  ? 'border-green-300 text-green-700 hover:bg-green-50'
                                  : 'border-orange-300 text-orange-700 hover:bg-orange-50'
                              }`}
                            >
                              {u.profile?.is_banned ? '解除' : 'BAN'}
                            </button>
                            {confirmDelete === u.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  className="text-xs px-2 py-1 rounded bg-danger text-white hover:opacity-80 transition-opacity"
                                >確定</button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="text-xs px-2 py-1 rounded border border-border hover:bg-gray-100 transition-colors"
                                >取消</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(u.id)}
                                className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                              >削除</button>
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

// ─── 経営ダッシュボード ───────────────────────────────────────────

const ROADMAP = [
  { phase: 0, title: 'プロダクト開発・ベータリリース', detail: 'MVP完成、Supabase/Next.js構築、決済統合テスト完了', done: true },
  { phase: 1, title: 'Stripe本番移行', detail: 'テストモード→本番切替、実際の課金開始', current: true, done: false },
  { phase: 2, title: '有料ユーザー 10名達成', detail: 'MRR ¥7,000〜¥10,000 → 固定費をほぼカバー', milestone: 'MRR ¥10,000', done: false },
  { phase: 3, title: 'プロダクトマーケットフィット確認', detail: '解約率5%以下、NPS計測開始、紹介経由ユーザー獲得', milestone: 'チャーン < 5%', done: false },
  { phase: 4, title: 'ベータ終了・正規価格移行', detail: 'ベータユーザーへの移行割引提供、正規価格（Pro ¥980、Business ¥4,980）適用', milestone: 'MRR ¥50,000', done: false },
  { phase: 5, title: '有料ユーザー 100名達成', detail: 'MRR ¥100,000超え、サービス収益化達成、機能拡張加速', milestone: 'MRR ¥100,000', done: false },
  { phase: 6, title: 'Enterprise / API提供', detail: 'ホワイトラベル・APIアクセス・チームプラン追加、ARPU向上', milestone: 'MRR ¥300,000', done: false },
  { phase: 7, title: '海外展開', detail: '英語UI・多通貨対応、海外マーケット参入', milestone: 'ARR ¥10M+', done: false },
]

function BusinessDashboard({ metrics }: { metrics: BusinessMetrics }) {
  const paidTotal = metrics.planCounts.pro + metrics.planCounts.business
  const maxGrowth = Math.max(...metrics.monthlyGrowth.map(m => m.cumulative), 1)

  return (
    <div className="space-y-8">

      {/* ─── 💰 CFO視点: 収益サマリー ─── */}
      <section>
        <SectionHeader icon="💰" label="CFO視点" title="収益サマリー" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <MetricCard
            label="MRR（月次経常収益）"
            value={`¥${metrics.mrr.toLocaleString()}`}
            sub="推定値（ベータ価格ベース）"
            color={metrics.mrr > 0 ? 'green' : 'gray'}
          />
          <MetricCard
            label="ARR（年次経常収益）"
            value={`¥${metrics.arr.toLocaleString()}`}
            sub="MRR × 12"
            color="blue"
          />
          <MetricCard
            label="有料ユーザー"
            value={`${paidTotal}名`}
            sub={`全体 ${metrics.totalUsers}名 中`}
            color="purple"
          />
          <MetricCard
            label="月次損益"
            value={`${metrics.profitLoss >= 0 ? '+' : ''}¥${metrics.profitLoss.toLocaleString()}`}
            sub={`固定費 ¥${metrics.fixedCosts.total.toLocaleString()}/月`}
            color={metrics.profitLoss >= 0 ? 'green' : 'red'}
          />
        </div>

        {/* 固定費内訳 */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-semibold text-foreground mb-3">推定固定費内訳（月次）</div>
          <div className="grid grid-cols-3 gap-3 text-sm mb-4">
            <CostRow label="Vercel Pro" amount={metrics.fixedCosts.vercel} />
            <CostRow label="Supabase Pro" amount={metrics.fixedCosts.supabase} />
            <CostRow label="ドメイン・その他" amount={metrics.fixedCosts.misc} />
          </div>
          <div className="text-xs text-muted">※ Stripe手数料（3.6% + ¥40/件）は変動費のため含まず。スケール時にSupabase Proへの移行が必要</div>
        </div>
      </section>

      {/* ─── 損益分岐点 ─── */}
      <section>
        <SectionHeader icon="📊" label="CFO視点" title="損益分岐点（Break-even Analysis）" />
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <div className="text-3xl font-bold text-foreground">{metrics.breakevenUsers}名</div>
              <div className="text-sm text-muted mt-1">損益分岐点（必要有料ユーザー数）</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-foreground">現在: {paidTotal}名</div>
              <div className={`text-sm font-medium ${metrics.breakevenProgress >= 100 ? 'text-success' : 'text-amber-600'}`}>
                達成率 {Math.round(metrics.breakevenProgress)}%
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-full h-4 mb-3 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all ${metrics.breakevenProgress >= 100 ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${metrics.breakevenProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
            <BreakevenScenario label="Proのみの場合" users={Math.ceil(metrics.fixedCosts.total / 715)} unit="名" />
            <BreakevenScenario label="Businessのみの場合" users={Math.ceil(metrics.fixedCosts.total / 3648)} unit="名" />
            <BreakevenScenario label="正規価格移行後（Pro）" users={Math.ceil(metrics.fixedCosts.total / 980)} unit="名" />
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>CFOコメント:</strong> 現在の固定費 ¥8,000/月に対し、Pro 12名 or Business 3名で収支均衡。
            ベータ終了後に正規価格（Pro ¥980）へ移行すれば分岐点が9名に下がり、収益性が向上します。
          </div>
        </div>
      </section>

      {/* ─── 📈 グロースハッカー視点 ─── */}
      <section>
        <SectionHeader icon="📈" label="グロースハッカー視点" title="成長・継続指標" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <MetricCard
            label="無料→有料 転換率"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            sub="業界平均: 2〜5%（SaaS）"
            color={metrics.conversionRate >= 5 ? 'green' : metrics.conversionRate >= 2 ? 'yellow' : 'red'}
          />
          <MetricCard
            label="月次チャーン率"
            value={`${metrics.churnRate.toFixed(1)}%`}
            sub="目標: 5%以下"
            color={metrics.churnRate <= 5 ? 'green' : metrics.churnRate <= 10 ? 'yellow' : 'red'}
          />
          <MetricCard
            label="ARPU（有料ユーザー単価）"
            value={paidTotal > 0 ? `¥${Math.round(metrics.arpu).toLocaleString()}` : '-'}
            sub="Pro/Business混合平均"
            color="blue"
          />
          <MetricCard
            label="LTV（顧客生涯価値）"
            value={paidTotal > 0 ? `¥${Math.round(metrics.ltv).toLocaleString()}` : '-'}
            sub="チャーン0の場合は36ヶ月試算"
            color="purple"
          />
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-semibold text-foreground mb-1">解約待ちユーザー</div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${metrics.cancelPending > 0 ? 'text-orange-600' : 'text-success'}`}>
              {metrics.cancelPending}名
            </span>
            <span className="text-sm text-muted">期間終了時にFreeへ移行予定</span>
          </div>
          {metrics.cancelPending > 0 && (
            <p className="mt-2 text-xs text-orange-600">
              解約理由のヒアリング・価格見直し・機能追加で引き留めを検討してください
            </p>
          )}
        </div>

        <div className="mt-4 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-700">
          <strong>グロースハッカーコメント:</strong> 転換率2〜5%が業界標準。
          まずは登録後7日以内のオンボーディング強化（使い方ガイド・メール）でFree→Pro転換を促進。
          チャーン削減にはユーザーインタビューが最も効果的です。
        </div>
      </section>

      {/* ─── 🎯 プロダクト戦略家視点 ─── */}
      <section>
        <SectionHeader icon="🎯" label="プロダクト戦略家視点" title="プラン分布・ユーザー成長" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* プラン分布 */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm font-semibold text-foreground mb-4">プラン分布</div>
            <div className="space-y-3">
              {[
                { label: 'Free', count: metrics.planCounts.free, color: 'bg-gray-300' },
                { label: 'Pro', count: metrics.planCounts.pro, color: 'bg-primary' },
                { label: 'Business', count: metrics.planCounts.business, color: 'bg-purple-500' },
              ].map(p => (
                <div key={p.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{p.label}</span>
                    <span className="text-muted">{p.count}名 ({metrics.totalUsers > 0 ? Math.round(p.count / metrics.totalUsers * 100) : 0}%)</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className={`${p.color} rounded-full h-2 transition-all`}
                      style={{ width: metrics.totalUsers > 0 ? `${(p.count / metrics.totalUsers) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 月次成長グラフ（簡易バーチャート） */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-sm font-semibold text-foreground mb-4">月次累計ユーザー推移（過去6ヶ月）</div>
            <div className="flex items-end gap-2 h-28">
              {metrics.monthlyGrowth.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/20 rounded-t relative group"
                    style={{ height: `${(m.cumulative / maxGrowth) * 100}%`, minHeight: '4px' }}
                  >
                    <div
                      className="w-full bg-primary rounded-t absolute bottom-0"
                      style={{ height: `${m.cumulative > 0 ? Math.max((m.paid / m.cumulative) * 100, 0) : 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted whitespace-nowrap">{m.month.slice(5)}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary/20 inline-block" />累計ユーザー</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary inline-block" />うち有料</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-violet-50 rounded-lg text-xs text-violet-700">
          <strong>プロダクトコメント:</strong> Businessプランの比率が高いほど健全。
          Free→Proの転換障壁を下げるために「QR5件まで無料試用」や「14日間Proトライアル」の導入を検討してください。
        </div>
      </section>

      {/* ─── 🗺️ ビジネスロードマップ ─── */}
      <section>
        <SectionHeader icon="🗺️" label="ビジネスストラテジスト視点" title="成長ロードマップ" />
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="relative">
            {ROADMAP.map((item, i) => (
              <div key={item.phase} className="flex gap-4 mb-6 last:mb-0">
                {/* ライン */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                    item.done
                      ? 'bg-success text-white'
                      : item.current
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-gray-100 text-muted border-2 border-border'
                  }`}>
                    {item.done ? '✓' : item.phase}
                  </div>
                  {i < ROADMAP.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-1 ${item.done ? 'bg-success' : 'bg-border'}`} style={{ minHeight: '16px' }} />
                  )}
                </div>

                <div className="pb-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${item.current ? 'text-primary' : item.done ? 'text-success' : 'text-foreground'}`}>
                      {item.title}
                    </span>
                    {item.current && (
                      <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">NOW</span>
                    )}
                    {item.milestone && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                        目標: {item.milestone}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
          <strong>ストラテジストコメント:</strong> フォーカスすべき最重要KPIは「有料転換数」と「チャーン率」の2つ。
          MRR ¥10,000（損益均衡）を最初のマイルストーンとし、そこから口コミ・SEO・アフィリエイトで有機的成長を目指してください。
          ベータ終了タイミング（Phase 4）で既存ユーザーへの価格移行コミュニケーションが最大の山場です。
        </div>
      </section>
    </div>
  )
}

// ─── サブコンポーネント ───────────────────────────────────────────

function TabButton({ children, active, onClick, badge }: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
        active ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
      }`}
    >
      {children}
      {!!badge && badge > 0 && (
        <span className="bg-danger text-white text-xs px-1.5 py-0.5 rounded-full leading-none">{badge}</span>
      )}
    </button>
  )
}

function SectionHeader({ icon, label, title }: { icon: string; label: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xl">{icon}</span>
      <div>
        <div className="text-xs text-muted font-medium uppercase tracking-wide">{label}</div>
        <div className="text-base font-bold text-foreground">{title}</div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, color }: {
  label: string
  value: string
  sub: string
  color: 'green' | 'red' | 'blue' | 'purple' | 'yellow' | 'gray'
}) {
  const colorMap = {
    green: 'text-success',
    red: 'text-danger',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    yellow: 'text-amber-600',
    gray: 'text-muted',
  }
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-muted mb-1 leading-snug">{label}</div>
      <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-muted mt-1">{sub}</div>
    </div>
  )
}

function CostRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-muted mb-0.5">{label}</div>
      <div className="font-semibold text-foreground">¥{amount.toLocaleString()}</div>
    </div>
  )
}

function BreakevenScenario({ label, users, unit }: { label: string; users: number; unit: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-sm">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className="font-bold text-foreground text-lg">{users}{unit}</div>
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

// ─── サイト設定（OGP管理） ───────────────────────────────────────

interface OgpInfo {
  hasCustom: boolean
  url: string | null
}

function SiteSettings() {
  const [ogp, setOgp] = useState<OgpInfo | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [previewTs, setPreviewTs] = useState(Date.now())
  const [imgError, setImgError] = useState(false)

  const fetchOgp = useCallback(async () => {
    const res = await fetch('/api/admin/ogp')
    if (res.ok) {
      setOgp(await res.json())
      setImgError(false)
    }
  }, [])

  useEffect(() => { fetchOgp() }, [fetchOgp])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/ogp', { method: 'POST', body: form })
    const result = await res.json()
    if (res.ok) {
      setMessage('OGP画像をアップロードしました')
      setPreviewTs(Date.now())
      await fetchOgp()
    } else {
      setMessage(`エラー: ${result.error}`)
    }
    setUploading(false)
    setTimeout(() => setMessage(''), 4000)
    e.target.value = ''
  }

  const handleDelete = async () => {
    if (!confirm('カスタム画像を削除して動的生成に戻しますか？')) return
    setDeleting(true)
    await fetch('/api/admin/ogp', { method: 'DELETE' })
    setMessage('カスタム画像を削除しました。動的生成に戻しました。')
    setPreviewTs(Date.now())
    await fetchOgp()
    setDeleting(false)
    setTimeout(() => setMessage(''), 4000)
  }

  const ogpPreviewUrl = `/opengraph-image?t=${previewTs}`

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">OGP画像設定</h2>
        <p className="text-sm text-muted">SNSシェア時・リンクプレビューに表示される画像を管理します（推奨: 1200×630px）</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.startsWith('エラー') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* 現在の画像プレビュー */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">現在のOGP画像プレビュー</span>
            {ogp && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                ogp.hasCustom ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
              }`}>
                {ogp.hasCustom ? 'カスタム画像' : '自動生成'}
              </span>
            )}
          </div>
          <a
            href={ogpPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            別タブで開く
          </a>
        </div>
        <div className="p-4 bg-gray-50">
          {imgError ? (
            <div
              className="w-full rounded-lg border border-border bg-gray-100 flex flex-col items-center justify-center gap-3 text-muted"
              style={{ aspectRatio: '1200/630' }}
            >
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">OGP画像の生成中または読み込みに失敗しました</p>
              <button
                onClick={() => { setImgError(false); setPreviewTs(Date.now()) }}
                className="text-xs px-3 py-1.5 rounded border border-border hover:bg-gray-200 transition-colors"
              >再試行</button>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={previewTs}
              src={ogpPreviewUrl}
              alt="OGP preview"
              className="w-full rounded-lg border border-border shadow-sm"
              style={{ aspectRatio: '1200/630', objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </div>

      {/* アップロード */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="text-sm font-semibold text-foreground mb-3">カスタム画像に差し替える</div>
        <p className="text-xs text-muted mb-4">PNG / JPG、推奨サイズ 1200×630px。アップロード後に即時反映されます。</p>
        <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-colors ${
          uploading ? 'bg-gray-100 text-gray-400 pointer-events-none' : 'bg-primary text-white hover:bg-primary-dark'
        }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {uploading ? 'アップロード中...' : '画像を選択してアップロード'}
          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* カスタム削除 */}
      {ogp?.hasCustom && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-semibold text-foreground mb-1">自動生成に戻す</div>
          <p className="text-xs text-muted mb-4">カスタム画像を削除して、ブランドカラーの自動生成OGPに戻します。</p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? '削除中...' : 'カスタム画像を削除'}
          </button>
        </div>
      )}

      {/* SNSプレビュー確認ツール */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <div className="text-sm font-semibold text-blue-800 mb-2">OGPデバッグツール</div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://cards-dev.twitter.com/validator`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-2 rounded border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            X (Twitter) Card Validator
          </a>
          <a
            href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent('https://redirect.tsuratsura.com')}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-2 rounded border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Facebook OGP Debugger
          </a>
          <a
            href={`https://search.google.com/test/rich-results?url=${encodeURIComponent('https://redirect.tsuratsura.com')}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-2 rounded border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Google リッチリザルト
          </a>
        </div>
      </div>
    </div>
  )
}

// ============================================
// クーポン管理セクション
// ============================================
function CouponsSection() {
  const [coupons, setCoupons] = useState<{ id: string; code: string; discount_percent: number; affiliate_user_id: string | null; max_uses: number | null; current_uses: number; is_active: boolean; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newDiscount, setNewDiscount] = useState(20)
  const [creating, setCreating] = useState(false)

  const fetchCoupons = useCallback(async () => {
    const res = await fetch('/api/admin/coupons')
    if (res.ok) setCoupons(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const handleCreate = async () => {
    if (!newCode.trim()) return
    setCreating(true)
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: newCode.trim(), discountPercent: newDiscount }),
    })
    if (res.ok) {
      setNewCode('')
      setShowForm(false)
      await fetchCoupons()
    }
    setCreating(false)
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    await fetchCoupons()
  }

  if (loading) return <div className="text-center py-10 text-muted text-sm">読み込み中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">クーポン管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
        >
          {showForm ? 'キャンセル' : '+ 新規作成'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted block mb-1">クーポンコード</label>
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="例: COMMUNITY2026"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">割引率(%)</label>
            <input
              type="number"
              value={newDiscount}
              onChange={(e) => setNewDiscount(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-lg border border-border text-sm bg-background"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !newCode.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {creating ? '作成中...' : '作成'}
          </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-foreground">コード</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">割引</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">使用数</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">ステータス</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                <td className="px-4 py-3">{c.discount_percent}%OFF</td>
                <td className="px-4 py-3">{c.current_uses}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_active ? '有効' : '無効'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(c.id, c.is_active)}
                    className={`text-xs px-3 py-1 rounded border transition-colors ${c.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    {c.is_active ? '無効化' : '有効化'}
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">クーポンがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================
// アフィリエイト管理セクション
// ============================================
function AffiliatesSection({ currentUserId }: { currentUserId: string }) {
  const [apps, setApps] = useState<{ id: string; user_id: string; email?: string; status: string; community_name: string | null; applied_at: string; has_bank_account?: boolean }[]>([])
  const [payouts, setPayouts] = useState<{ id: string; affiliate_user_id: string; amount: number; active_referrals: number; period_start: string; status: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const [appsRes, payoutsRes] = await Promise.all([
      fetch('/api/admin/affiliates'),
      fetch('/api/admin/payouts'),
    ])
    if (appsRes.ok) setApps(await appsRes.json())
    if (payoutsRes.ok) setPayouts(await payoutsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAction = async (id: string, status: string) => {
    setActionId(id)
    await fetch(`/api/admin/affiliates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchData()
    setActionId(null)
  }

  const handleCalculatePayouts = async () => {
    setActionId('calc')
    await fetch('/api/admin/payouts', { method: 'POST' })
    await fetchData()
    setActionId(null)
  }

  const handlePayoutAction = async (id: string, status: string) => {
    setActionId(id)
    await fetch(`/api/admin/payouts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchData()
    setActionId(null)
  }

  if (loading) return <div className="text-center py-10 text-muted text-sm">読み込み中...</div>

  const pending = apps.filter(a => a.status === 'pending')

  return (
    <div className="space-y-8">
      {/* 申請一覧 */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">
          アフィリエイト申請
          {pending.length > 0 && (
            <span className="ml-2 text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{pending.length}件</span>
          )}
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">ユーザー</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">コミュニティ</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">申請日</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">口座</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">ステータス</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-xs font-mono">{a.email || a.user_id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{a.community_name || '-'}</td>
                  <td className="px-4 py-3 text-xs text-muted">{new Date(a.applied_at).toLocaleDateString('ja-JP')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      a.has_bank_account ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {a.has_bank_account ? '登録済' : '未登録'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      a.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {a.status === 'approved' ? '承認済' : a.status === 'pending' ? '審査中' : '却下'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {a.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(a.id, 'approved')}
                          disabled={actionId === a.id}
                          className="text-xs px-3 py-1 rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                        >
                          承認
                        </button>
                        <button
                          onClick={() => handleAction(a.id, 'rejected')}
                          disabled={actionId === a.id}
                          className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          却下
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">申請がありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 報酬管理 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">報酬管理</h2>
          <button
            onClick={handleCalculatePayouts}
            disabled={actionId === 'calc'}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {actionId === 'calc' ? '計算中...' : '今月分を計算'}
          </button>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">期間</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">紹介数</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">報酬</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">ステータス</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">明細書</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-xs">{p.period_start}</td>
                  <td className="px-4 py-3">{p.active_referrals}人</td>
                  <td className="px-4 py-3 font-semibold">¥{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.status === 'paid' ? '支払済' : p.status === 'approved' ? '承認済' : p.status === 'pending' ? '未処理' : '却下'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(p.status === 'approved' || p.status === 'paid') && (
                      <a
                        href={`/api/admin/payouts/${p.id}/statement`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1 rounded border border-violet-200 text-violet-600 hover:bg-violet-50 transition-colors inline-block"
                      >
                        明細書
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {p.status === 'pending' && (
                      <button
                        onClick={() => handlePayoutAction(p.id, 'approved')}
                        disabled={actionId === p.id}
                        className="text-xs px-3 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                      >
                        承認
                      </button>
                    )}
                    {p.status === 'approved' && (
                      <button
                        onClick={() => handlePayoutAction(p.id, 'paid')}
                        disabled={actionId === p.id}
                        className="text-xs px-3 py-1 rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                      >
                        支払済
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">報酬データがありません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

