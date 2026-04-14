'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AffiliateApplication, Coupon, AffiliateStats, AffiliatePayout, BankAccount } from '@/types/affiliate'

type StatusData = {
  application: AffiliateApplication | null
  coupon: Coupon | null
}

interface BankForm {
  bankName: string
  branchName: string
  accountType: '普通' | '当座'
  accountNumber: string
  accountHolder: string
}

const initialBankForm: BankForm = {
  bankName: '',
  branchName: '',
  accountType: '普通',
  accountNumber: '',
  accountHolder: '',
}

export default function AffiliateClient() {
  const [loading, setLoading] = useState(true)
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [stats, setStats] = useState<AffiliateStats | null>(null)
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // フォーム入力
  const [communityName, setCommunityName] = useState('')
  const [communityUrl, setCommunityUrl] = useState('')
  const [motivation, setMotivation] = useState('')

  // コピー通知
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // 振込先情報
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null)
  const [bankForm, setBankForm] = useState<BankForm>(initialBankForm)
  const [bankEditing, setBankEditing] = useState(false)
  const [bankSaving, setBankSaving] = useState(false)
  const [bankError, setBankError] = useState('')

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/affiliate/status')
      if (res.ok) {
        const data: StatusData = await res.json()
        setStatusData(data)

        // 承認済みの場合はstatsと振込先情報も取得
        if (data.application?.status === 'approved') {
          const [statsRes, bankRes] = await Promise.all([
            fetch('/api/affiliate/stats'),
            fetch('/api/affiliate/bank-account'),
          ])
          if (statsRes.ok) {
            const statsData: AffiliateStats & { payouts?: AffiliatePayout[] } = await statsRes.json()
            setStats(statsData)
          }
          if (bankRes.ok) {
            const bankData: BankAccount | null = await bankRes.json()
            setBankAccount(bankData)
            if (bankData) {
              setBankForm({
                bankName: bankData.bank_name,
                branchName: bankData.branch_name,
                accountType: bankData.account_type,
                accountNumber: bankData.account_number,
                accountHolder: bankData.account_holder,
              })
            }
          }
        }
      }
    } catch {
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleApply = async () => {
    if (!communityName.trim()) {
      setError('コミュニティ名を入力してください')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityName: communityName.trim(),
          communityUrl: communityUrl.trim() || undefined,
          motivation: motivation.trim() || undefined,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || '申請に失敗しました')
        return
      }
      // 再取得
      await fetchStatus()
    } catch {
      setError('申請に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // fallback
    }
  }

  const handleBankSave = async () => {
    setBankError('')
    if (!bankForm.bankName.trim() || !bankForm.branchName.trim() || !bankForm.accountNumber.trim() || !bankForm.accountHolder.trim()) {
      setBankError('全ての項目を入力してください')
      return
    }
    setBankSaving(true)
    try {
      const res = await fetch('/api/affiliate/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankForm),
      })
      const result = await res.json()
      if (!res.ok) {
        setBankError(result.error || '保存に失敗しました')
        return
      }
      setBankAccount(result as BankAccount)
      setBankEditing(false)
    } catch {
      setBankError('保存に失敗しました')
    } finally {
      setBankSaving(false)
    }
  }

  const handleReapply = () => {
    setStatusData((prev) => prev ? { ...prev, application: null } : null)
    setCommunityName('')
    setCommunityUrl('')
    setMotivation('')
  }

  // --- ローディング ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const application = statusData?.application
  const coupon = statusData?.coupon

  // --- 申請フォーム（未申請 or 再申請） ---
  if (!application || (application.status === 'rejected' && !statusData?.application)) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">アフィリエイトプログラム</h1>
        <p className="text-muted mb-8">
          Pivolinkを紹介して報酬を得ましょう。承認されるとあなた専用のクーポンコードが発行されます。
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              コミュニティ名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder="例: テックコミュニティ東京"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              コミュニティURL（任意）
            </label>
            <input
              type="url"
              value={communityUrl}
              onChange={(e) => setCommunityUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              申請理由
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={4}
              placeholder="Pivolinkをどのように紹介したいかを教えてください"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-none"
            />
          </div>

          <button
            onClick={handleApply}
            disabled={submitting}
            className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? '送信中...' : 'アフィリエイトに申請する'}
          </button>
        </div>
      </div>
    )
  }

  // --- 審査中 ---
  if (application.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">アフィリエイトプログラム</h1>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">申請を受付けました</h2>
          <p className="text-muted mb-4">管理者の承認をお待ちください。</p>
          <p className="text-sm text-muted">
            申請日: {new Date(application.applied_at).toLocaleDateString('ja-JP')}
          </p>
        </div>
      </div>
    )
  }

  // --- 却下 ---
  if (application.status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">アフィリエイトプログラム</h1>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">申請が却下されました</h2>
          {application.rejection_reason && (
            <p className="text-muted mb-4">
              理由: {application.rejection_reason}
            </p>
          )}
          <button
            onClick={handleReapply}
            className="mt-4 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition"
          >
            再申請する
          </button>
        </div>
      </div>
    )
  }

  // --- 承認済みダッシュボード ---
  const couponCode = stats?.couponCode || coupon?.code || ''
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/dashboard/plan?coupon=${couponCode}`
    : ''

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">アフィリエイトダッシュボード</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted mb-1">紹介ユーザー数</p>
          <p className="text-3xl font-bold text-foreground">
            {stats?.totalReferrals ?? 0}
          </p>
          <p className="text-xs text-muted mt-1">
            アクティブ: {stats?.activeReferrals ?? 0}名
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted mb-1">未払い報酬</p>
          <p className="text-3xl font-bold text-foreground">
            ¥{(stats?.pendingPayout ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted mt-1">承認待ち含む</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted mb-1">累計報酬</p>
          <p className="text-3xl font-bold text-foreground">
            ¥{(stats?.totalEarnings ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted mt-1">支払い済み合計</p>
        </div>
      </div>

      {/* クーポンコード & 紹介リンク */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">紹介ツール</h2>

        {/* クーポンコード */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">クーポンコード</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-2.5 bg-gray-50 border border-border rounded-lg text-foreground font-mono text-sm select-all">
              {couponCode}
            </code>
            <button
              onClick={() => handleCopy(couponCode, 'coupon')}
              className="shrink-0 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition"
            >
              {copiedField === 'coupon' ? 'コピー済み' : 'コピー'}
            </button>
          </div>
        </div>

        {/* 紹介リンク */}
        <div>
          <label className="block text-sm font-medium text-muted mb-1">紹介リンク</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-2.5 bg-gray-50 border border-border rounded-lg text-foreground font-mono text-sm truncate select-all">
              {referralLink}
            </code>
            <button
              onClick={() => handleCopy(referralLink, 'link')}
              className="shrink-0 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition"
            >
              {copiedField === 'link' ? 'コピー済み' : 'コピー'}
            </button>
          </div>
        </div>
      </div>

      {/* 報酬履歴 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">報酬履歴</h2>

        {stats?.monthlyEarnings && stats.monthlyEarnings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted">期間</th>
                  <th className="text-right py-3 px-2 font-medium text-muted">紹介数</th>
                  <th className="text-right py-3 px-2 font-medium text-muted">金額</th>
                </tr>
              </thead>
              <tbody>
                {stats.monthlyEarnings.map((entry) => (
                  <tr key={entry.month} className="border-b border-border last:border-0">
                    <td className="py-3 px-2 text-foreground">{entry.month}</td>
                    <td className="py-3 px-2 text-right text-foreground">{entry.referrals}名</td>
                    <td className="py-3 px-2 text-right text-foreground">¥{entry.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted text-center py-8">まだ報酬履歴はありません</p>
        )}
      </div>

      {/* 振込先情報 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">振込先情報</h2>

        {bankError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {bankError}
          </div>
        )}

        {bankAccount && !bankEditing ? (
          // 登録済み表示
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted">銀行名</span>
                <p className="font-medium text-foreground">{bankAccount.bank_name}</p>
              </div>
              <div>
                <span className="text-muted">支店名</span>
                <p className="font-medium text-foreground">{bankAccount.branch_name}</p>
              </div>
              <div>
                <span className="text-muted">口座種別</span>
                <p className="font-medium text-foreground">{bankAccount.account_type}</p>
              </div>
              <div>
                <span className="text-muted">口座番号</span>
                <p className="font-medium text-foreground">{bankAccount.account_number}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted">口座名義</span>
                <p className="font-medium text-foreground">{bankAccount.account_holder}</p>
              </div>
            </div>
            <button
              onClick={() => setBankEditing(true)}
              className="mt-2 text-sm text-primary hover:underline"
            >
              編集
            </button>
          </div>
        ) : (
          // フォーム表示
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                銀行名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                placeholder="例: 三菱UFJ銀行"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                支店名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bankForm.branchName}
                onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                placeholder="例: 渋谷支店"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                口座種別 <span className="text-red-500">*</span>
              </label>
              <select
                value={bankForm.accountType}
                onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value as '普通' | '当座' })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              >
                <option value="普通">普通</option>
                <option value="当座">当座</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                口座番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                placeholder="例: 1234567"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                口座名義（カタカナ） <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bankForm.accountHolder}
                onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                placeholder="例: ニシカワ タロウ"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBankSave}
                disabled={bankSaving}
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {bankSaving ? '保存中...' : bankAccount ? '更新する' : '登録する'}
              </button>
              {bankAccount && (
                <button
                  onClick={() => {
                    setBankEditing(false)
                    setBankError('')
                    setBankForm({
                      bankName: bankAccount.bank_name,
                      branchName: bankAccount.branch_name,
                      accountType: bankAccount.account_type,
                      accountNumber: bankAccount.account_number,
                      accountHolder: bankAccount.account_holder,
                    })
                  }}
                  className="px-6 py-2.5 border border-border text-foreground font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  キャンセル
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
