import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/Logo'
import { SITE_URL } from '@/lib/site'
import ConsultForm from './ConsultForm'
import { SwitchDiagram, MechGlyph } from './Diagram'
import { PainFigures, Bubble } from './PainScene'

export const metadata: Metadata = {
  title: '観光・自治体の周遊施策 | アプリを作らずQRで動かす — Pivolink',
  description:
    '観光の周遊促進、季節ごとの案内切替、訪日客の言語振分、緊急時の告知。アプリを作らず、既にある印刷物のQRで動かせます。企画の組み立てからご一緒します。',
  alternates: { canonical: `${SITE_URL}/biz/tourism` },
}

const PAINS = [
  { t: '刷ってしまうと、もう変えられない', b: 'パンフレットや看板に載せたURLは、内容が変わるたびに刷り直しになります。予算が残らず、古い案内のまま置かれ続けることも珍しくありません。' },
  { t: '紙の施策は効果が測れない', b: '何部配ったかは分かっても、何人が見たかは分かりません。翌年の予算を取るための根拠が作れない。' },
  { t: 'アプリを作っても入れてもらえない', b: '観光アプリはダウンロードという段差で大半が離れます。滞在時間の短い来訪者ほど、その一手間を越えません。' },
  { t: '一箇所に集中して、周遊してもらえない', b: '有名な場所だけが混み、少し離れた場所には人が流れない。分散させたいが、動線を設計する仕組みがない。' },
]

const IDEAS = [
  { g: 'step' as const, m: 'スキャン回数で分岐', t: '何度もめぐりたくなる周遊', b: '同じQRでも1回目・2回目・3回目で行き先が変わります。訪れるたびに違う案内が出るので、1枚の掲示が周遊の装置になります。', img: '/cases/tourism.jpg', alt: '夕暮れの京都、八坂の塔へ続く石畳の路地' },
  { g: 'season' as const, m: 'スケジュール切替', t: '季節で入れ替わる観光案内', b: '桜・新緑・紅葉・雪。時期ごとの特設ページへ自動で切り替わります。看板はそのまま、中身だけが季節に追いつきます。', img: '/cases/tourism-2.jpg', alt: '富士山を望む街並みと五重塔' },
  { g: 'lang' as const, m: 'デバイス別振分', t: '訪日客の言語を自動で振り分け', b: '端末の環境に応じて日本語・英語の案内を出し分けます。多言語の看板を何枚も立てる必要がありません。', img: '/cases/tourism-3.jpg', alt: '日本語の看板が並ぶ商店街' },
  { g: 'time' as const, m: '時間帯切替', t: '朝と夕でモデルコースを変える', b: '午前は少し遠い場所へ、夕方は駅に近い場所へ。時間帯で行き先を変え、混雑と交通の時間を味方につけます。', img: '/cases/restaurant.jpg', alt: '夕暮れに灯りがともる飲食店の店内' },
  { g: 'ab' as const, m: 'A/Bテスト', t: '2つの動線を並走させて比べる', b: '同じ掲示から2ルートへ半分ずつ流し、どちらが回遊されたかを数字で比べます。翌年の企画に根拠が残ります。', img: '/cases/ec-3.jpg', alt: '来訪データのグラフが表示された画面' },
  { g: 'urgent' as const, m: '即時URL変更', t: '運休・災害時にその場で差し替える', b: '交通の運休、悪天候、工事。掲示物を回収せずに、管理画面から緊急のお知らせへ即座に切り替えられます。', img: '/cases/retail-3.jpg', alt: '店頭に掲げられた案内サイン' },
]

const FLOW = [
  { n: '01', t: 'ご相談', b: 'いまお持ちの印刷物と、やりたいことを教えてください。フォームだけで構いません。' },
  { n: '02', t: '企画のご提案', b: '御庁・御社に合わせた活用企画を、こちらで組み立ててお持ちします。ここまで無料です。' },
  { n: '03', t: '設計・制作', b: '仕組みの設定に加え、必要ならLP・印刷物・広告物までまとめて制作します。' },
  { n: '04', t: '運用と検証', b: '公開後は数字を見ながら行き先を調整します。刷り直しは発生しません。' },
]

const COMPARE = [
  { axis: '使い始めるまで', app: 'アプリストアから探して、ダウンロードと会員登録が要ります。', qr: 'カメラを向けるだけ。インストールも登録もありません。' },
  { axis: '個人情報', app: 'アカウント登録を伴うと、氏名やメールを預かることになります。', qr: '個人情報を預からずに運用できます。' },
  { axis: 'いまある印刷物', app: 'アプリへ誘導する導線を、印刷物に作り直して載せる必要があります。', qr: '既存のパンフレットや看板のQRに、そのまま乗せられます。' },
  { axis: '内容の更新', app: 'ストアの審査や更新作業を挟むため、反映まで時間がかかります。', qr: '管理画面から変更すれば、その場で切り替わります。' },
  { axis: '使われなかった時', app: '開発費が先に出ているため、途中でやめる判断がしにくくなります。', qr: '行き先を変えるだけで別の施策に転用できます。' },
]

const SCOPE = ['活用企画の立案', 'Pivolinkの設定・個別カスタマイズ', '特設サイト・LPの制作', 'パンフレット・ポスター等の制作', '効果測定とレポート', '公開後の運用・改善']

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '観光・自治体向け QR周遊施策の企画・制作',
  serviceType: '観光DX / 周遊促進施策の企画・制作',
  provider: { '@type': 'Organization', name: 'TSURATSURA', url: 'https://tsuratsura.com' },
  areaServed: { '@type': 'Country', name: '日本' },
  description: '観光の周遊促進、季節ごとの案内切替、訪日客の言語振分、緊急時の告知を、アプリ開発なしにQRコードで実現する施策の企画・制作。',
  url: `${SITE_URL}/biz/tourism`,
}

/**
 * セクション見出しの共通型。短い緑の罫＋見出し＋リード。
 * 装飾は罫1本だけに絞る（このページの緑は「ここが要点」の合図として小面積でのみ使う）。
 */
function SectionHeading({
  children, lead, align = 'left',
}: { children: React.ReactNode; lead?: React.ReactNode; align?: 'left' | 'center' }) {
  const c = align === 'center'
  return (
    <div className={`mb-12 ${c ? 'text-center' : ''}`}>
      <h2 className="text-[clamp(1.55rem,3vw,2.25rem)] font-bold leading-[1.38] tracking-[-0.01em] [word-break:keep-all] [font-feature-settings:'palt']">
        {children}
      </h2>
      {lead && (
        <p className={`mt-4 text-[15px] leading-[1.9] text-[#41566E] ${c ? 'mx-auto max-w-[38em]' : 'max-w-[38em]'}`}>
          {lead}
        </p>
      )}
    </div>
  )
}

export default function TourismBizPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#0F2942]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/"><Logo size="sm" /></Link>
          <a href="#consult" className="rounded-lg bg-[#0F2942] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1B3B5A]">
            企画を相談する
          </a>
        </div>
      </header>

      {/* ヒーロー：メインビジュアルは写真。図解は直下に独立させて役割を分ける */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,46%)_minmax(0,54%)] lg:gap-14">
            <div>
              <p className="mb-5 text-[13px] font-medium tracking-[0.14em] text-[#41566E]">
                観光事業者・自治体・観光協会・DMO の方へ
              </p>
              <h1 className="mb-6 text-[clamp(1.9rem,4.2vw,3rem)] font-bold leading-[1.28] [word-break:keep-all] [font-feature-settings:'palt']">
                いま配っている紙のまま、<br />
                案内の中身だけを<br />
                <span className="relative inline-block">
                  変え続けられます
                  <span className="absolute -bottom-1 left-0 h-[6px] w-full bg-[#10B981]/25" aria-hidden />
                </span>
              </h1>
              <p className="max-w-[34em] text-[15px] leading-[1.9] text-[#41566E]">
                アプリの開発も、印刷物の刷り直しも必要ありません。
                「どう企画に活かすか」から、制作会社としてご一緒します。
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#consult" className="rounded-lg bg-[#0F2942] px-7 py-4 font-bold text-white transition-colors hover:bg-[#1B3B5A]">
                  活用企画を相談する（無料）
                </a>
                <a href="#ideas" className="text-sm font-medium text-[#41566E] underline underline-offset-4 hover:text-[#0F2942]">
                  どんな企画が組めるか見る
                </a>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/cases/tourism.jpg"
                alt="夕暮れの京都、八坂の塔へ続く石畳の路地を歩く来訪者"
                width={800} height={480} priority
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm md:aspect-[5/4]"
              />
              <p className="mt-3 text-right text-[12px] text-[#41566E]">
                同じ掲示から、来訪のたびに違う場所へ案内する
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 仕組み：ヒーローで惹きつけたあと、1画面で理解させる */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 pb-14 md:pb-20">
          <div className="rounded-2xl border border-slate-200 bg-[#F7F9FB] p-6 md:p-10">
            <h2 className="mb-2 text-center text-[clamp(1.15rem,2.2vw,1.5rem)] font-bold [font-feature-settings:'palt']">
              仕組みは、これだけです
            </h2>
            <p className="mx-auto mb-8 max-w-[32em] text-center text-[14px] leading-[1.9] text-[#41566E]">
              掲示物は1枚のまま。行き先だけがルールで切り替わります。
            </p>
            <div className="mx-auto max-w-2xl">
              <SwitchDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* 課題：担当者の言葉として見せる。吹き出し4つ＋人物イラスト */}
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <SectionHeading align="center" lead="観光・自治体の現場でよく聞く4つです。">
          こんなお悩み、ありませんか？
        </SectionHeading>

        <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
          {PAINS.slice(0, 2).map((p, i) => (
            <Bubble key={p.t} side={i === 0 ? 'left' : 'right'} dir="down">
              <h3 className="mb-2 text-[16px] font-bold [word-break:keep-all]">{p.t}</h3>
              <p className="text-[14px] leading-[1.9] text-[#41566E]">{p.b}</p>
            </Bubble>
          ))}
        </div>

        <div className="my-7 flex justify-center md:my-8">
          <PainFigures />
        </div>

        <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
          {PAINS.slice(2).map((p, i) => (
            <Bubble key={p.t} side={i === 0 ? 'left' : 'right'} dir="up">
              <h3 className="mb-2 text-[16px] font-bold [word-break:keep-all]">{p.t}</h3>
              <p className="text-[14px] leading-[1.9] text-[#41566E]">{p.b}</p>
            </Bubble>
          ))}
        </div>
      </section>

      {/* 企画例 */}
      <section id="ideas" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <SectionHeading lead="機能の一覧ではなく、企画の形でご覧ください。すべて Pivolink の仕組みで実際に動かせるものです。">
            たとえば、こんな企画が組めます
          </SectionHeading>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {IDEAS.map(i => (
              <article key={i.t} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
                <Image src={i.img} alt={i.alt} width={800} height={480} className="h-44 w-full object-cover" />
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-2 text-[#10B981]">
                    <MechGlyph kind={i.g} />
                    <span className="text-[12px] font-bold tracking-wide text-[#41566E]">{i.m}</span>
                  </div>
                  <h3 className="mb-2.5 text-[17px] font-bold leading-snug [word-break:keep-all]">{i.t}</h3>
                  <p className="text-[14px] leading-[1.9] text-[#41566E]">{i.b}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border-2 border-[#10B981] bg-[#F2FBF7] px-6 py-10 text-center md:px-12">
            <p className="mb-2 text-[13px] font-bold tracking-[0.12em] text-[#10B981]">ここに無い形でも構いません</p>
            <p className="mx-auto mb-7 max-w-[26em] text-[clamp(1.15rem,2.4vw,1.6rem)] font-bold leading-[1.6] [word-break:keep-all] [font-feature-settings:'palt']">
              「こういうことをやりたい」から、<br className="hidden md:block" />
              ご相談ください。
            </p>
            <a href="#consult" className="inline-block rounded-lg bg-[#0F2942] px-9 py-4 font-bold text-white transition-colors hover:bg-[#1B3B5A]">
              活用企画を相談する（無料）
            </a>
            <p className="mt-4 text-[13px] text-[#41566E]">御庁・御社に合わせた企画を、こちらで組み立ててお持ちします</p>
          </div>
        </div>
      </section>

      {/* なぜQRか：見出しが問いなので、答えは必ず「比較」の形にする */}
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <SectionHeading lead="周遊や多言語の施策では、まず専用アプリが検討されることが多いと思います。アプリが悪いわけではありませんが、観光の現場では次の点で噛み合わないことがあります。">
          アプリを作る場合と、何が違うのか
        </SectionHeading>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-slate-100 text-[13px] font-bold md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="hidden px-5 py-3.5 md:block" />
            <div className="px-5 py-3.5 text-[#41566E]">専用アプリを作る場合</div>
            <div className="bg-[#0F2942] px-5 py-3.5 text-white">QRで動かす場合</div>
          </div>

          {COMPARE.map((row, i) => (
            <div
              key={row.axis}
              className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] ${
                i % 2 ? 'bg-[#F7F9FB]' : 'bg-white'
              }`}
            >
              <div className="col-span-2 border-b border-slate-200 px-5 pb-1 pt-4 text-[13px] font-bold text-[#0F2942] md:col-span-1 md:border-b-0 md:border-r md:py-5">
                {row.axis}
              </div>
              <div className="px-5 py-4 text-[14px] leading-[1.85] text-[#41566E] md:py-5">{row.app}</div>
              <div className="border-l border-slate-200 bg-[#F2FBF7] px-5 py-4 text-[14px] font-medium leading-[1.85] text-[#0F2942] md:py-5">
                {row.qr}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[13px] leading-[1.9] text-[#41566E]">
          アプリが向く場面もあります。会員を継続的に囲い込みたい、位置情報を常時使いたい、といった場合です。
          「一度きりの来訪者にその場で案内を届ける」用途では、QRのほうが噛み合います。
        </p>
      </section>

      {/* 進め方 */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <SectionHeading lead="ご相談から公開後の運用まで、4つの段階で進めます。企画のご提案までは費用をいただきません。">
            進め方
          </SectionHeading>
          <ol className="grid gap-8 md:grid-cols-4">
            {FLOW.map(f => (
              <li key={f.n} className="border-t border-slate-300 pt-5">
                <span className="mb-3 block font-mono text-[13px] tracking-widest text-[#10B981]">{f.n}</span>
                <h3 className="mb-2 text-[16px] font-bold">{f.t}</h3>
                <p className="text-[14px] leading-[1.9] text-[#41566E]">{f.b}</p>
              </li>
            ))}
          </ol>

          <div className="mt-16 overflow-hidden rounded-2xl bg-[#0F2942] text-white">
            <div className="px-7 py-10 md:px-12 md:py-14">
              <h3 className="mb-4 text-[clamp(1.35rem,2.6vw,1.9rem)] font-bold leading-[1.45] [word-break:keep-all] [font-feature-settings:'palt']">
                企画から制作、公開後の運用まで。<br className="hidden md:block" />
                まとめてお引き受けします。
              </h3>
              <p className="mb-9 max-w-[38em] text-[15px] leading-[1.9] text-white/70">
                私たちは Web 制作・EC 構築・広告運用を本業とする制作会社です。
                仕組みだけを渡して終わりにしません。担当者が社内調整に集中できるよう、手を動かす部分は引き受けます。
              </p>

              <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {SCOPE.map(s => (
                  <li key={s} className="flex items-start gap-3 border-t border-white/15 pt-4">
                    <svg viewBox="0 0 20 20" className="mt-[3px] h-[18px] w-[18px] shrink-0 text-[#10B981]" aria-hidden>
                      <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[15px] font-medium leading-snug">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 bg-white/[0.04] px-7 py-6 md:flex-row md:px-12">
              <p className="text-[14px] text-white/75">
                どこまでお願いできるかも、ご相談の中で決められます。
              </p>
              <a href="#consult" className="shrink-0 rounded-lg bg-white px-7 py-3.5 font-bold text-[#0F2942] transition-colors hover:bg-slate-100">
                相談してみる
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 相談 */}
      <section id="consult" className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <SectionHeading>活用企画のご相談</SectionHeading>
        <p className="-mt-6 mb-10 max-w-[36em] text-[15px] leading-[1.9] text-[#41566E]">
          いただいた内容をもとに、<strong className="font-bold text-[#0F2942]">御庁・御社での活用企画をこちらで組み立ててお持ちします</strong>。
          ここまで費用はいただきません。「何ができるか分からない」の状態からで大丈夫です。
        </p>
        <ConsultForm />
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
          <Logo size="sm" />
          <nav className="flex flex-wrap justify-center gap-6 text-[13px] text-[#41566E]">
            <Link href="/" className="hover:text-[#0F2942]">サービストップ</Link>
            <Link href="/cases" className="hover:text-[#0F2942]">活用アイデア</Link>
            <Link href="/terms" className="hover:text-[#0F2942]">利用規約</Link>
            <Link href="/privacy" className="hover:text-[#0F2942]">プライバシー</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
