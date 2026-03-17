'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { PLANS, IS_BETA, type PlanId } from '@/lib/plans'
import type { UserSubscription } from '@/lib/subscription'

interface SubscriptionData {
  subscription: UserSubscription
  plan: (typeof PLANS)[PlanId]
  usage: {
    qr_codes: number
    scans_this_month: number
  }
}

export default function PlanClient() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [changing, setChanging] = useState<PlanId | null>(null)
  const [message, setMessage] = useState('')

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/subscription')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    if (searchParams.get('success') === 'true') {
      setMessage('プランのアップグレードが完了しました')
      setTimeout(() => setMessage(''), 5000)
    }
    if (searchParams.get('canceled') === 'true') {
      setMessage('プラン変更がキャンセルされました')
      setTimeout(() => setMessage(''), 5000)
    }
  }, [fetchData, searchParams])

  const handleChangePlan = async (planId: PlanId) => {
    if (!data) return
    if (planId === data.subscription.plan) return

    const planName = PLANS[planId].name
    const isDowngrade = PLANS[planId].price < PLANS[data.subscription.plan].price

    if (isDowngrade && !confirm(`${planName}プランにダウングレードしますか？`)) return

    setChanging(planId)
    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })

    if (res.ok) {
      const result = await res.json()
      // Stripe Checkoutにリダイレクト
      if (result.url) {
        window.location.href = result.url
        return
      }
      // 即時変更（ダウングレード等）
      setMessage(result.message)
      await fetchData()
      setTimeout(() => setMessage(''), 4000)
    }
    setChanging(null)
  }

  const handleManageBilling = async () => {
    const res = await fetch('/api/subscription/portal', { method: 'POST' })
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!data) return null

  const currentPlan = data.subscription.plan
  const limits = data.plan.limits
  const hasStripe = !!data.subscription.stripe_customer_id

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">プラン管理</h1>
          <p className="text-muted text-sm mt-1">現在のプランと利用状況を確認・変更できます</p>
        </div>
        {hasStripe && (
          <button
            onClick={handleManageBilling}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
          >
            請求・支払い管理
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm mb-6 ${
          message.includes('キャンセル') ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {data.subscription.cancel_at_period_end && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-lg text-sm mb-6">
          現在のプランは請求期間の終了時（{data.subscription.current_period_end
            ? new Date(data.subscription.current_period_end).toLocaleDateString('ja-JP')
            : ''}）にFreeプランに変更されます。
        </div>
      )}

      {/* 現在のプラン・利用状況 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="text-sm text-muted mb-1">現在のプラン</div>
          <div className="text-2xl font-bold text-primary">{PLANS[currentPlan].name}</div>
          <div className="text-sm text-muted mt-1">{PLANS[currentPlan].priceLabel}/月</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="text-sm text-muted mb-1">QR / NFC 使用数</div>
          <div className="text-2xl font-bold text-foreground">
            {data.usage.qr_codes}
            <span className="text-base font-normal text-muted">
              {limits.maxQrCodes === -1 ? ' / 無制限' : ` / ${limits.maxQrCodes}`}
            </span>
          </div>
          {limits.maxQrCodes !== -1 && (
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${Math.min((data.usage.qr_codes / limits.maxQrCodes) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="text-sm text-muted mb-1">今月のアクセス数</div>
          <div className="text-2xl font-bold text-foreground">
            {data.usage.scans_this_month.toLocaleString()}
            <span className="text-base font-normal text-muted">
              {limits.maxScansPerMonth === -1 ? ' / 無制限' : ` / ${limits.maxScansPerMonth.toLocaleString()}`}
            </span>
          </div>
          {limits.maxScansPerMonth !== -1 && (
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${Math.min((data.usage.scans_this_month / limits.maxScansPerMonth) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* プラン一覧 */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-foreground">プランを選択</h2>
        {IS_BETA && (
          <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
            Beta限定 20%OFF（正式リリースまで）
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.values(PLANS) as (typeof PLANS)[PlanId][]).map(plan => {
          const isCurrent = plan.id === currentPlan
          const isDowngrade = PLANS[plan.id].price < PLANS[currentPlan].price
          const isUpgrade = PLANS[plan.id].price > PLANS[currentPlan].price

          return (
            <div
              key={plan.id}
              className={`bg-card rounded-xl border-2 p-6 relative ${
                plan.popular ? 'border-primary shadow-lg' : isCurrent ? 'border-primary/30' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  人気
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                {IS_BETA && plan.betaPriceLabel ? (
                  <>
                    <span className="text-lg text-foreground/40 line-through mr-2">{plan.priceLabel}</span>
                    <span className="text-3xl font-bold text-foreground">{plan.betaPriceLabel}</span>
                    <span className="text-muted text-sm"> /月</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-foreground">{plan.priceLabel}</span>
                    <span className="text-muted text-sm"> /月</span>
                  </>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-success mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full py-2.5 text-center rounded-lg border-2 border-primary text-primary font-medium text-sm">
                  現在のプラン
                </div>
              ) : (
                <button
                  onClick={() => handleChangePlan(plan.id)}
                  disabled={changing !== null}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${
                    isUpgrade
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'border border-border text-muted hover:bg-gray-50'
                  }`}
                >
                  {changing === plan.id
                    ? '処理中...'
                    : isUpgrade
                      ? 'アップグレード'
                      : isDowngrade
                        ? 'ダウングレード'
                        : '選択'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
