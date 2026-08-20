'use client'

import { useState } from 'react'
import { pushEvent } from '@/lib/gtm'

/**
 * 法人・自治体向けの企画相談フォーム。
 *
 * 無料登録ではなく**相談**が本命のコンバージョン。
 * 送信内容は /api/contact に流し、管理者へメール通知される（category = 企画・導入のご相談）。
 * 「どんな販促物を既に持っているか」を聞くのは、企画を作るのに一番効く情報だから。
 */

const ASSETS = [
  'パンフレット・チラシ',
  '看板・サイン・のぼり',
  'ポスター・POP',
  'スタンプラリー台紙',
  'ノベルティ・グッズ',
  'まだ何もない',
]

const KINDS = ['観光事業者（施設・宿泊・交通など）', '自治体・観光協会・DMO', '商店街・地域団体', 'その他']

export default function ConsultForm() {
  const [org, setOrg] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [kind, setKind] = useState(KINDS[0])
  const [assets, setAssets] = useState<string[]>([])
  const [body, setBody] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const toggle = (a: string) =>
    setAssets(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('sending')

    const message = [
      `【種別】${kind}`,
      `【団体・企業名】${org}`,
      `【既にある販促物】${assets.length ? assets.join('・') : '未記入'}`,
      '',
      '【やりたいこと・お困りごと】',
      body,
    ].join('\n')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, category: 'consulting', message }),
    })

    if (!res.ok) {
      setState('error')
      return
    }
    pushEvent('consult_request', { kind })
    setState('done')
  }

  if (state === 'done') {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="text-xl font-bold text-[#0F2942] mb-2">ご相談を受け付けました</h3>
        <p className="text-[#41566E] text-sm leading-relaxed">
          内容を拝見したうえで、3営業日以内にご連絡します。<br />
          いただいた情報をもとに、御社・御庁での活用企画をこちらで組み立ててお持ちします。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-5 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-[#0F2942] mb-1.5">どちらに近いですか</label>
        <select
          value={kind}
          onChange={e => setKind(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-[#0F2942]"
        >
          {KINDS.map(k => <option key={k}>{k}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0F2942] mb-1.5">団体・企業名</label>
          <input
            required value={org} onChange={e => setOrg(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#0F2942]"
            placeholder="〇〇観光協会"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F2942] mb-1.5">ご担当者名</label>
          <input
            required value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#0F2942]"
            placeholder="山田 太郎"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0F2942] mb-1.5">メールアドレス</label>
        <input
          required type="email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#0F2942]"
          placeholder="mail@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0F2942] mb-2">
          既にお持ちの販促物（複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {ASSETS.map(a => (
            <button
              type="button" key={a} onClick={() => toggle(a)}
              className={`px-3.5 py-2 rounded-full text-sm border transition-colors ${
                assets.includes(a)
                  ? 'bg-[#0F2942] text-white border-[#0F2942]'
                  : 'bg-white text-[#41566E] border-slate-200 hover:border-[#0F2942]'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#41566E] mt-2">
          いま使っている紙やサインが分かると、企画がぐっと具体的になります。
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0F2942] mb-1.5">
          やりたいこと・お困りごと
        </label>
        <textarea
          required rows={5} value={body} onChange={e => setBody(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#0F2942]"
          placeholder="例：市内の観光客が一箇所に集中してしまう。周遊してもらう仕掛けを作りたいが、アプリを作る予算はない。"
        />
      </div>

      {state === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          送信に失敗しました。お手数ですが時間をおいて再度お試しください。
        </p>
      )}

      <button
        type="submit" disabled={state === 'sending'}
        className="w-full py-4 bg-[#0F2942] text-white font-bold rounded-lg hover:bg-[#1B3B5A] transition-colors disabled:opacity-50"
      >
        {state === 'sending' ? '送信中…' : '企画のご相談をする（無料）'}
      </button>
      <p className="text-xs text-[#41566E] text-center">
        しつこい営業はしません。ご相談だけでも構いません。
      </p>
    </form>
  )
}
