import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import Logo from '@/components/Logo'
import CaseStudyCard from '@/components/CaseStudyCard'
import {
  RestaurantIllust, RetailIllust, RealEstateIllust, EventIllust,
  SalonIllust, TourismIllust, ManufacturingIllust, EcIllust,
  GymIllust, PublisherIllust, EducationIllust, HotelIllust,
} from '@/components/CaseIllustrations'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="#features" className="text-foreground/70 hover:text-foreground transition-colors font-medium text-sm hidden sm:block">
              機能
            </Link>
            <Link href="#pricing" className="text-foreground/70 hover:text-foreground transition-colors font-medium text-sm hidden sm:block">
              料金
            </Link>
            <Link href="#faq" className="text-foreground/70 hover:text-foreground transition-colors font-medium text-sm hidden sm:block">
              FAQ
            </Link>
            <Link href="/login" className="text-foreground/70 hover:text-foreground transition-colors font-medium text-sm">
              ログイン
            </Link>
            <Link
              href="/login?tab=signup"
              className="gradient-bg text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-300/30 transition-all font-semibold text-sm"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 pt-28 pb-20 md:pt-36 md:pb-28">
        {/* 背景装飾 */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 text-center relative">
          <div className="animate-fade-in-up inline-block bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-5 py-1.5 rounded-full text-sm font-semibold mb-8 border border-emerald-200/50">
            QRコード &amp; NFCタグのリダイレクト管理
          </div>
          <h1 className="animate-fade-in-up delay-100 text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.15] mb-8 tracking-tight">
            印刷済みQR・設置済みNFCの<br />
            <span className="gradient-text">リダイレクト先</span>を<br />
            いつでも変更
          </h1>
          <p className="animate-fade-in-up delay-200 text-base md:text-lg text-foreground/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            チラシ・名刺・パッケージのQRコードも、店頭・商品に埋め込んだNFCタグも、<br className="hidden md:block" />
            管理画面からワンクリックで遷移先を変更。再印刷・再設置は不要です。
          </p>
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login?tab=signup"
              className="gradient-bg text-white px-9 py-4 rounded-xl text-lg font-bold hover:shadow-xl hover:shadow-emerald-300/40 hover:-translate-y-0.5 transition-all"
            >
              無料アカウントを作成
            </Link>
            <Link
              href="#features"
              className="border-2 border-foreground/15 text-foreground px-9 py-4 rounded-xl text-lg font-bold hover:bg-white hover:border-foreground/25 hover:-translate-y-0.5 transition-all"
            >
              機能を見る
            </Link>
          </div>
        </div>
      </section>

      {/* QR & NFC 両対応バナー */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10 pb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <ScrollReveal animation="slide-in-left">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-lg shadow-black/5 card-hover flex items-start gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shrink-0 text-primary animate-float">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">QRコード対応</h3>
                <p className="text-foreground/70 leading-relaxed">チラシ・名刺・ポスター・パッケージに印刷したQRコードの遷移先を、いつでも管理画面から変更。PNG/SVGで自動生成も可能。</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="slide-in-right" delay={150}>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-lg shadow-black/5 card-hover flex items-start gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-200 rounded-xl flex items-center justify-center shrink-0 text-accent animate-float" style={{ animationDelay: '1.5s' }}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">NFCタグ対応</h3>
                <p className="text-foreground/70 leading-relaxed">店頭POP・商品タグ・カードに埋め込んだNFCタグのURLを後から変更。タグの書き換えや交換は一切不要です。</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 仕組み */}
      <section className="bg-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4 tracking-tight">3ステップで簡単運用</h2>
            <p className="text-center text-foreground/65 mb-14 text-base">登録からURL変更まで、わずか数クリック</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'リダイレクトURLを作成',
                desc: 'スラッグとリダイレクト先URLを登録。QRコードは自動生成、NFCタグにはそのURLを書き込むだけ。',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: 'QR印刷・NFC設置',
                desc: 'QRコードをチラシや名刺に印刷、NFCタグを店頭やパッケージに設置して配布。',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: 'いつでもURL変更',
                desc: 'キャンペーン変更？管理画面でリダイレクト先を変えるだけ。再印刷も再設置も不要です。',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} animation="scale-in" delay={i * 150}>
                <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-8 border border-border card-hover text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
                    {item.icon}
                  </div>
                  <div className="inline-block text-xs font-bold text-white gradient-bg px-3 py-1 rounded-full mb-3">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 活用事例 */}
      <section id="cases" className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4 tracking-tight">活用事例</h2>
            <p className="text-center text-foreground/65 mb-14 text-base">業種を問わず、QR・NFCの「変えられない」を解決します</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {([
              { icon: '🍽️', industry: '飲食店', title: 'テーブルNFCで季節メニュー自動切替', problem: '季節メニューの度にNFCタグを全テーブル分書き換えていた', solution: 'Pivolinkのスケジュール切替で、季節ごとに自動でメニューページが切り替わる', feature: 'スケジュール切替', featureColor: 'bg-blue-100 text-blue-700', illust: <RestaurantIllust /> },
              { icon: '👕', industry: '小売・アパレル', title: '商品NFCタグからECへ直結', problem: '売り切れ商品のNFCタグが404ページに飛んでいた', solution: '売り切れたら管理画面から類似商品ページに即変更。機会損失ゼロ', feature: 'URL変更', featureColor: 'bg-indigo-100 text-indigo-700', illust: <RetailIllust /> },
              { icon: '🏠', industry: '不動産', title: '物件チラシQRを次の物件に使い回し', problem: '成約済み物件のチラシ数千枚が毎回廃棄になっていた', solution: 'QRのリダイレクト先を新物件に差し替え。同じチラシを再利用', feature: 'URL変更', featureColor: 'bg-indigo-100 text-indigo-700', illust: <RealEstateIllust /> },
              { icon: '🎪', industry: 'イベント会社', title: '1枚のチラシで年間イベントを回す', problem: '毎月のイベントごとにQRチラシを印刷し直していた', solution: '同じQRチラシを年間配布。スケジュール設定で告知ページが自動で切り替わる', feature: 'スケジュール切替', featureColor: 'bg-blue-100 text-blue-700', illust: <EventIllust /> },
              { icon: '💇', industry: '美容サロン', title: '名刺QRを自社予約システムに移行', problem: 'ホットペッパー予約から自社システムに移行したいが名刺を刷り直す予算がない', solution: '名刺のQRはそのままで、リダイレクト先だけを新予約ページに変更', feature: 'URL変更', featureColor: 'bg-indigo-100 text-indigo-700', illust: <SalonIllust /> },
              { icon: '🗾', industry: '観光・自治体', title: '多言語案内をデバイスで自動振分', problem: '外国人観光客が日本語ページに飛んで離脱していた', solution: 'iOSは日本語、Androidは英語、PCは詳細マップに自動振り分け', feature: 'デバイス別振分', featureColor: 'bg-purple-100 text-purple-700', illust: <TourismIllust /> },
              { icon: '🏭', industry: '製造業', title: 'パッケージQRでリコール即時対応', problem: 'リコール発生時、パッケージのQRが通常の取説ページのままだった', solution: '管理画面からワンクリックでリコール告知ページに即時切替', feature: '緊急URL変更', featureColor: 'bg-red-100 text-red-700', illust: <ManufacturingIllust /> },
              { icon: '📦', industry: 'ECショップ', title: '同梱QRでレビュー vs クーポンをA/Bテスト', problem: 'どちらの施策が効果的か分からず、感覚で運用していた', solution: 'トラフィックを50:50に分割。レビュー誘導とクーポンの効果をデータで比較', feature: 'A/Bテスト', featureColor: 'bg-orange-100 text-orange-700', illust: <EcIllust /> },
              { icon: '🏋️', industry: 'フィットネスジム', title: '入口NFCで月替わりキャンペーン配信', problem: '入口の案内POPを毎月貼り替える手間がかかっていた', solution: 'NFCタグ1つで月替わりのキャンペーンページに自動切替', feature: 'スケジュール切替', featureColor: 'bg-blue-100 text-blue-700', illust: <GymIllust /> },
              { icon: '📚', industry: '出版社・メディア', title: '雑誌QRで連載の最新話へ誘導', problem: '毎号QRコードを変更するためDTPの修正コストが発生していた', solution: '全号同じQRコードを印刷。リダイレクト先を毎週最新話URLに更新するだけ', feature: 'URL変更', featureColor: 'bg-indigo-100 text-indigo-700', illust: <PublisherIllust /> },
              { icon: '🎓', industry: '学習塾・教育', title: '教材QRの補足動画を毎年差し替え', problem: '教材のQRが去年の講師の動画に飛んでいた', solution: '今年の講師の動画URLに差し替え。教材の刷り直し不要', feature: 'URL変更', featureColor: 'bg-indigo-100 text-indigo-700', illust: <EducationIllust /> },
              { icon: '🏨', industry: 'ホテル・旅館', title: '客室NFCで季節の観光ガイド', problem: '客室の観光パンフレットが古い情報のままだった', solution: 'NFCタップで春は花見、夏は海、冬はスキー場ガイドに自動切替', feature: 'スケジュール切替', featureColor: 'bg-blue-100 text-blue-700', illust: <HotelIllust /> },
            ] as const).map((c, i) => (
              <ScrollReveal key={c.industry} animation="fade-in-up" delay={(i % 3) * 120}>
                <CaseStudyCard
                  icon={c.icon}
                  industry={c.industry}
                  title={c.title}
                  problem={c.problem}
                  solution={c.solution}
                  feature={c.feature}
                  featureColor={c.featureColor}
                  illustration={c.illust}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 機能一覧 */}
      <section id="features" className="bg-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4 tracking-tight">充実の機能</h2>
            <p className="text-center text-foreground/65 mb-14 text-base">QRコード・NFCタグの運用に必要な機能がすべて揃っています</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'QRコード自動生成', desc: 'PNG/SVGでダウンロード。ロゴ埋め込みも可能。', icon: '🔲' },
              { title: 'NFCタグURL管理', desc: 'NFCに書き込むURLを一元管理。遷移先はいつでも変更可能。', icon: '📱' },
              { title: 'アクセス解析', desc: 'スキャン・タップ数をデバイス・地域別にリアルタイム可視化。', icon: '📈' },
              { title: '変更履歴', desc: 'いつ・誰が・どのURLに変更したか完全ログ。', icon: '📋' },
              { title: 'スケジュール切替', desc: '日時指定でリダイレクト先を自動切替。', icon: '⏰' },
              { title: 'デバイス別振分', desc: 'iOS/Android/PCで異なるURLへ振り分け。', icon: '🖥️' },
              { title: 'A/Bテスト', desc: 'トラフィックを分割して効果を比較。', icon: '⚡' },
              { title: 'クッションページ', desc: 'リダイレクト前にお知らせやクーポンを表示。', icon: '🎫' },
              { title: '有効期限設定', desc: '期限切れ時は指定ページにフォールバック。', icon: '📅' },
            ].map((f, i) => (
              <ScrollReveal key={f.title} animation="fade-in-up" delay={i * 80}>
                <div className="bg-gradient-to-b from-slate-50/50 to-white rounded-xl p-6 border border-border card-hover group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 transition-colors duration-250 group-hover:bg-primary/20">
                    <span className="text-xl leading-none">{f.icon}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-2">{f.title}</h3>
                  <p className="text-foreground/65 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 料金プラン */}
      <section id="pricing" className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4 tracking-tight">料金プラン</h2>
            <p className="text-center text-foreground/65 mb-14 text-base">無料から始めて、必要に応じてスケールアップ</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {[
              {
                name: 'Free',
                price: '¥0',
                desc: 'まずは試してみたい方に',
                features: ['QR/NFCリダイレクト 3件', '月間アクセス 1,000回', '基本アクセス解析', 'QRコード自動生成', '変更履歴ログ'],
                cta: '無料で始める',
                popular: false,
              },
              {
                name: 'Pro',
                price: '¥980',
                desc: '本格運用したい方に',
                features: ['QR/NFCリダイレクト 50件', '月間アクセス 50,000回', '詳細アクセス解析', 'スケジュール / デバイス別振分', 'A/Bテスト', 'クッションページ', 'CSVエクスポート'],
                cta: 'Proで始める',
                popular: true,
              },
              {
                name: 'Business',
                price: '¥4,980',
                desc: '大規模運用・チーム向け',
                features: ['QR/NFCリダイレクト 無制限', '月間アクセス 無制限', '詳細アクセス解析', '全ルール機能', 'クッションページ', 'CSVエクスポート', '優先サポート'],
                cta: 'Businessで始める',
                popular: false,
              },
            ].map((plan, i) => (
              <ScrollReveal key={plan.name} animation="scale-in" delay={i * 150}>
                <div
                  className={`bg-card rounded-2xl p-8 relative card-hover ${
                    plan.popular
                      ? 'border-2 border-emerald-400 shadow-xl shadow-emerald-200/30 md:scale-105'
                      : 'border border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-bg text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
                      人気
                    </div>
                  )}
                  <h3 className="text-xl font-extrabold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-foreground/65 mb-5">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-foreground/55 text-sm"> /月</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login?tab=signup"
                    className={`block w-full py-3.5 rounded-xl text-center font-bold transition-all text-sm ${
                      plan.popular
                        ? 'gradient-bg text-white hover:shadow-lg hover:shadow-emerald-300/30 hover:-translate-y-0.5'
                        : 'border-2 border-foreground/10 text-foreground hover:border-foreground/25 hover:bg-slate-50 hover:-translate-y-0.5'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4 tracking-tight">よくある質問</h2>
            <p className="text-center text-foreground/65 mb-14 text-base">ご利用前の疑問にお答えします</p>
          </ScrollReveal>
          <div className="space-y-4">
            {[
              {
                q: 'Pivolinkとは何ですか？',
                a: 'QRコードやNFCタグのリダイレクト先URLを、管理画面からいつでも変更できるサービスです。印刷済みのQRコードや設置済みのNFCタグを作り直すことなく、遷移先だけを切り替えられます。',
              },
              {
                q: 'QRコードとNFCタグの違いは？',
                a: 'QRコードはカメラでスキャンして読み取る二次元バーコードです。NFCタグはスマートフォンをかざすだけで読み取れるICチップで、店頭POPや商品タグに埋め込まれます。Pivolinkでは両方のリダイレクト先を同じ管理画面で一元管理できます。',
              },
              {
                q: 'セキュリティは大丈夫ですか？第三者にURLを改ざんされませんか？',
                a: 'ご安心ください。リダイレクト先の変更は、アカウントにログインした所有者本人のみが行えます。データベースレベルでの行単位セキュリティ（RLS）と、API認証の二重防御で保護されています。',
              },
              {
                q: '無料プランでも使えますか？',
                a: 'はい。Freeプランではリダイレクト3件・月間1,000アクセスまで無料でご利用いただけます。クレジットカードの登録も不要です。',
              },
              {
                q: 'QRコードを印刷した後でもリダイレクト先を変更できますか？',
                a: 'はい、それがPivolinkの最大の特長です。QRコード自体のURLは固定ですが、その先のリダイレクト先は管理画面からいつでも何度でも変更可能です。',
              },
              {
                q: 'NFCタグのURLはどうやって設定しますか？',
                a: 'Pivolinkで発行されるリダイレクトURL（例: pivolink.com/r/xxxxx）をNFCタグに書き込むだけです。以後はPivolinkの管理画面からリダイレクト先を変更すれば、タグを書き換える必要はありません。',
              },
              {
                q: 'スケジュール切替やA/Bテストはどのプランで使えますか？',
                a: 'ProプランとBusinessプランでご利用いただけます。Freeプランではデフォルトのリダイレクトのみとなります。',
              },
              {
                q: 'プランはいつでも変更できますか？',
                a: 'はい、管理画面の「プラン管理」からいつでもアップグレード・ダウングレードが可能です。アップグレードは即時反映、ダウングレードは現在の請求期間終了時に反映されます。',
              },
              {
                q: '解約はできますか？',
                a: 'はい、いつでも解約可能です。解約後もFreeプランとして引き続きご利用いただけます。データが削除されることはありません。',
              },
            ].map((item, i) => (
              <ScrollReveal key={i} animation="fade-in-up" delay={i * 60}>
                <details className="group bg-gradient-to-b from-slate-50/50 to-white rounded-xl border border-border card-hover">
                  <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
                    <span className="font-bold text-foreground pr-4">{item.q}</span>
                    <svg className="w-5 h-5 text-foreground/40 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 text-foreground/70 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="scale-in">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 animate-gradient rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-5">QRもNFCも、もう再発行は不要</h2>
                <p className="text-white/75 mb-10 max-w-xl mx-auto text-base leading-relaxed">
                  一度配布したQRコード・設置したNFCタグのURLを、いつでも何度でも変更できます。
                  まずは無料でお試しください。
                </p>
                <Link
                  href="/login?tab=signup"
                  className="inline-block bg-white text-emerald-600 px-9 py-4 rounded-xl text-lg font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  無料アカウントを作成
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-border bg-white py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-foreground/55">
              &copy; 2026 Pivolink. All rights reserved.
            </div>
            <nav className="flex flex-wrap justify-center gap-4 text-sm text-foreground/55">
              <a href="/terms" className="hover:text-foreground transition-colors">利用規約</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</a>
              <a href="/tokusho" className="hover:text-foreground transition-colors">特定商取引法</a>
              <a href="/contact" className="hover:text-foreground transition-colors">お問い合わせ</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
