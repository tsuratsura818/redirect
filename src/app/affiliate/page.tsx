import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'

export const metadata: Metadata = {
  title: 'アフィリエイトプログラム | Pivolink',
  description: 'Pivolinkのアフィリエイトプログラム。あなたのコミュニティにPivolinkを紹介して、継続報酬を受け取りませんか？紹介ユーザー1人あたり月100円の永続報酬。',
}

const steps = [
  {
    num: '1',
    title: '無料アカウント作成',
    desc: 'まずPivolinkの無料アカウントを作成してください。Freeプランのまま申請可能です。',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    num: '2',
    title: 'アフィリエイト申請',
    desc: 'ダッシュボードの「アフィリエイト」ページからコミュニティ情報を入力して申請します。',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    num: '3',
    title: '承認後、紹介リンクを取得',
    desc: '審査通過後、あなた専用のクーポンコードと紹介リンクが発行されます。',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    num: '4',
    title: 'コミュニティに共有',
    desc: '紹介リンクをSNS・ブログ・メルマガ・コミュニティで共有するだけ。あとは自動です。',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  {
    num: '5',
    title: '毎月報酬を受け取る',
    desc: '紹介ユーザーが有料プランを継続している限り、毎月自動で報酬が発生します。',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const faqs = [
  {
    q: '申請に費用はかかりますか？',
    a: '一切かかりません。Pivolinkの無料アカウントがあれば誰でも申請できます。',
  },
  {
    q: '報酬はいつ支払われますか？',
    a: '毎月1日に前月分の報酬が自動計算され、承認後にお支払いします。振込先はダッシュボードから登録できます。',
  },
  {
    q: '紹介ユーザーが解約した場合は？',
    a: '有料プランを解約したユーザーは報酬のカウント対象から外れます。再度有料プランに戻った場合は自動的に復活します。',
  },
  {
    q: '紹介リンクの有効期限はありますか？',
    a: 'ありません。リンクは永続的に有効で、いつ誰がクリックしても正しく追跡されます。',
  },
  {
    q: '自分のコミュニティでなくても申請できますか？',
    a: 'はい。ブログ、SNS、YouTube、メルマガなど、Pivolinkを紹介できる媒体をお持ちであれば申請可能です。',
  },
  {
    q: '紹介ユーザーにはどんな特典がありますか？',
    a: 'あなたの紹介リンク経由で登録したユーザーは、有料プランが永続20%OFFになります。双方にメリットがある仕組みです。',
  },
]

export default function AffiliateLPPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link
            href="/login?tab=signup"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/40 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="inline-block bg-teal-100 text-teal-800 px-5 py-1.5 rounded-full text-sm font-semibold mb-6 border border-teal-200/50">
            Pivolink アフィリエイトプログラム
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-6 tracking-tight">
            あなたのコミュニティに<br />
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Pivolinkを紹介して報酬を得る
            </span>
          </h1>
          <p className="text-foreground/60 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            コミュニティのメンバーにPivolinkを紹介するだけ。
            紹介ユーザーは永続20%OFF、あなたには1人あたり月100円の継続報酬。
            双方にメリットがあるプログラムです。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login?tab=signup"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:shadow-xl hover:shadow-teal-300/30 hover:-translate-y-0.5 transition-all"
            >
              今すぐ申請する
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-foreground/15 text-foreground px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 hover:-translate-y-0.5 transition-all"
            >
              仕組みを見る
            </a>
          </div>
        </div>
      </section>

      {/* 報酬シミュレーション */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-4">
            報酬シミュレーション
          </h2>
          <p className="text-center text-foreground/60 mb-10">
            紹介ユーザーが有料プランを継続している限り、毎月報酬が発生します
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { users: 10, monthly: 1000, annual: 12000, label: '小規模コミュニティ' },
              { users: 50, monthly: 5000, annual: 60000, label: '中規模コミュニティ' },
              { users: 100, monthly: 10000, annual: 120000, label: '大規模コミュニティ' },
            ].map((sim) => (
              <div key={sim.users} className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-lg transition-shadow">
                <p className="text-sm text-foreground/50 mb-2">{sim.label}</p>
                <p className="text-4xl font-extrabold text-foreground mb-1">
                  {sim.users}<span className="text-lg font-normal text-foreground/50">人</span>
                </p>
                <p className="text-sm text-foreground/50 mb-4">の有料ユーザーを紹介</p>
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                  <p className="text-2xl font-extrabold text-teal-700">
                    &yen;{sim.monthly.toLocaleString()}<span className="text-sm font-normal">/月</span>
                  </p>
                  <p className="text-xs text-teal-600 mt-1">
                    年間 &yen;{sim.annual.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-foreground/40 mt-6">
            ※ 報酬は紹介ユーザー1人あたり月100円（税込）。有料プラン継続中のユーザーのみカウント。
          </p>
        </div>
      </section>

      {/* 仕組み（ステップ） */}
      <section id="how-it-works" className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-4">
            始め方はかんたん5ステップ
          </h2>
          <p className="text-center text-foreground/60 mb-12">
            申請から報酬受取まで、すべてオンラインで完結します
          </p>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-start gap-5 group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-teal-200/50">
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-10 bg-teal-200 mt-2" />
                  )}
                </div>
                <div className="pt-1.5 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-teal-600">{step.icon}</span>
                    <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-foreground/60 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 紹介する側・される側のメリット */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-10">
            双方にメリットがある仕組み
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 紹介する側 */}
            <div className="bg-white rounded-2xl border border-teal-200 p-8">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">あなた（紹介者）のメリット</h3>
              <ul className="space-y-3">
                {[
                  '紹介ユーザー1人あたり月100円の継続報酬',
                  '有料プラン継続中は永続的に報酬が発生',
                  '紹介数の上限なし',
                  'ダッシュボードでリアルタイムに成果確認',
                  '初期費用・月額費用ゼロ',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <svg className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 紹介される側 */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">紹介されたユーザーのメリット</h3>
              <ul className="space-y-3">
                {[
                  '有料プランが永続20%OFF',
                  'Pro月額: ¥780 → ¥624',
                  'Business月額: ¥3,980 → ¥3,184',
                  '通常の機能制限なし（フル機能利用可能）',
                  'いつでもプラン変更・解約可能',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ダッシュボードイメージ */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-4">
            専用ダッシュボードで成果を管理
          </h2>
          <p className="text-center text-foreground/60 mb-10">
            承認後、あなた専用のダッシュボードが利用可能になります
          </p>

          <div className="bg-slate-50 rounded-2xl border border-border p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <p className="text-sm text-foreground/50 mb-1">紹介ユーザー数</p>
                <p className="text-3xl font-extrabold text-foreground">24<span className="text-base font-normal text-foreground/40">人</span></p>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <p className="text-sm text-foreground/50 mb-1">今月の報酬</p>
                <p className="text-3xl font-extrabold text-teal-600">&yen;2,400</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 text-center">
                <p className="text-sm text-foreground/50 mb-1">累計報酬</p>
                <p className="text-3xl font-extrabold text-foreground">&yen;18,600</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <p className="text-sm font-semibold text-foreground mb-3">あなたの紹介リンク</p>
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-border px-4 py-3">
                <code className="text-sm text-teal-700 flex-1 truncate">
                  https://redirect.tsuratsura.com/dashboard/plan?coupon=AFF-EXAMPLE
                </code>
                <span className="shrink-0 px-3 py-1.5 rounded-lg bg-teal-500 text-white text-xs font-bold">
                  コピー
                </span>
              </div>
              <p className="text-xs text-foreground/40 mt-2">
                このリンクをクリックしたユーザーには自動でクーポンが適用されます
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-foreground mb-10">
            よくある質問
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-border">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
                  <span className="font-bold text-foreground pr-4 text-sm md:text-base">{faq.q}</span>
                  <svg className="w-5 h-5 text-foreground/30 shrink-0 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-foreground/60 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-teal-500 to-emerald-500 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            今すぐアフィリエイトを始めましょう
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            無料アカウント作成 → アフィリエイト申請 → 紹介リンク取得<br />
            すべて無料、最短5分で完了します
          </p>
          <Link
            href="/login?tab=signup"
            className="inline-block bg-white text-teal-600 px-10 py-4 rounded-xl text-lg font-bold hover:shadow-xl transition-all"
          >
            無料で始める
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-foreground/40">
          &copy; {new Date().getFullYear()} Pivolink by TSURATSURA
        </p>
      </footer>
    </div>
  )
}
