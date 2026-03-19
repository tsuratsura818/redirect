import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'QRコードを「資産」に変える — Pivolink | 交流会特別ご案内',
  description: '印刷済みのQRコードや設置済みNFCタグのリンク先を、管理画面からいつでも変更できるSaaSサービスです。経営者・店舗オーナーの方へ。',
}

const problems = [
  {
    icon: '🖨️',
    title: 'キャンペーンのたびに刷り直し',
    desc: 'チラシや名刺のQRコード、URLが変わるたびに印刷費と手間が発生していませんか？',
  },
  {
    icon: '📦',
    title: '商品パッケージのQRがリンク切れ',
    desc: 'ECサイト移転・商品ページのURL変更で、すでに配布済みのQRが404になってしまう。',
  },
  {
    icon: '🏪',
    title: 'NFCタグを毎月書き換える作業',
    desc: '店頭や客室のNFCタグを季節ごと・キャンペーンごとに書き換える手間と人件費。',
  },
]

const features = [
  { icon: '🔗', title: 'URLをいつでも変更', desc: '管理画面からワンクリック。変更は即時反映。' },
  { icon: '📅', title: 'スケジュール切替', desc: '指定日時に自動でリンク先を切り替え。' },
  { icon: '📱', title: 'デバイス別振分', desc: 'iOS・Android・PCで異なるページへ誘導。' },
  { icon: '🔀', title: 'A/Bテスト', desc: 'トラフィックを分割して効果を比較検証。' },
  { icon: '📊', title: 'アクセス解析', desc: 'スキャン数・デバイス・地域をリアルタイム確認。' },
  { icon: '🎫', title: 'クッションページ', desc: '遷移前にクーポンやお知らせを表示。' },
]

const plans = [
  { name: 'Free', price: '¥0', desc: '今すぐ試す', features: ['リンク3件', '月間1,000スキャン', 'QRコード生成'], highlight: false },
  { name: 'Pro', price: '¥780', badge: '交流会特別価格', originalPrice: '¥980', desc: '/月（税込）', features: ['リンク50件', '月間50,000スキャン', '全ルール機能', 'A/Bテスト・スケジュール'], highlight: true },
]

export default function EventPage() {
  return (
    <div style={{ fontFamily: "'Inter','Hiragino Kaku Gothic ProN',sans-serif", color: '#0f172a', background: '#f8fafc' }}>

      {/* ヘッダー */}
      <header style={{
        background: '#0f172a', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: 'linear-gradient(to bottom, #43e97b, #10b981)' }} />
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.04em', color: '#ffffff' }}>
            PIVO<span style={{ color: '#10b981' }}>LINK</span>
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 4, padding: '2px 5px' }}>β</span>
        </div>
        <a
          href="https://redirect.tsuratsura.com/login?tab=signup"
          style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', background: '#10b981', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          無料で始める
        </a>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        padding: '64px 24px 72px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>交流会 特別ご案内</span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 6vw, 44px)', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            QRコードは<br />
            <span style={{ color: '#10b981' }}>「使い捨て」</span>じゃない。
          </h1>
          <p style={{ fontSize: 'clamp(15px, 3vw, 18px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '20px 0 36px' }}>
            印刷済みのQRコードも、設置済みのNFCタグも、<br />
            リンク先を管理画面からいつでも変更できます。<br />
            再印刷・再設置は不要。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <a
              href="https://redirect.tsuratsura.com/login?tab=signup"
              style={{
                display: 'inline-block', background: 'linear-gradient(135deg, #10b981, #38f9d7)',
                color: '#0f172a', fontWeight: 800, fontSize: 16, padding: '16px 40px',
                borderRadius: 14, textDecoration: 'none', letterSpacing: '0.01em',
                boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
              }}
            >
              無料アカウントを作成
            </a>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>クレジットカード不要 · 即日開始</div>
          </div>
        </div>
      </section>

      {/* 課題 */}
      <section style={{ padding: '64px 24px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', marginBottom: 10 }}>THE PROBLEM</div>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
            こんな経験、ありませんか？
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {problems.map((p, i) => (
            <div key={i} style={{
              display: 'flex', gap: 18, background: '#ffffff',
              border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px 22px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{p.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ソリューション */}
      <section style={{ background: '#0f172a', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', marginBottom: 10 }}>THE SOLUTION</div>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 34px)', fontWeight: 800, color: '#ffffff', margin: '0 0 16px', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
            Pivolinkで、QRコードを<br />
            <span style={{ color: '#10b981' }}>「ずっと使える資産」</span>に
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: '0 0 48px' }}>
            Pivolinkが発行するURLをQR/NFCに設定するだけ。<br />
            リンク先はいつでも管理画面から変更できます。
          </p>

          {/* Before / After */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 48, textAlign: 'left' }}>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '20px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.08em', marginBottom: 12 }}>BEFORE</div>
              {['URLが変わったら刷り直し', 'NFCを毎回書き換え', 'キャンペーン終了でQR廃棄', 'リンク切れを放置'].map(t => (
                <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: '#ef4444', fontSize: 14, flexShrink: 0 }}>✕</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 14, padding: '20px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: '0.08em', marginBottom: 12 }}>AFTER</div>
              {['URLは管理画面から即変更', 'NFCタグは設置したまま', 'QRを再利用し続ける', '常に正しいページへ誘導'].map(t => (
                <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 14, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 機能 */}
      <section style={{ padding: '64px 24px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', marginBottom: 10 }}>FEATURES</div>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 800, margin: 0 }}>主な機能</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {features.map(f => (
            <div key={f.title} style={{
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14,
              padding: '20px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 料金・特別オファー */}
      <section style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>交流会ご参加の方へ</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
            ベータ期間中は全プラン<br /><span style={{ color: '#10b981' }}>20% OFF</span>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 40, lineHeight: 1.7 }}>
            正式リリース前のベータ期間中は、有料プランを特別価格でご提供。<br />
            Freeプランはクレジットカード不要で今すぐ開始できます。
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 36 }}>
            {plans.map(p => (
              <div key={p.name} style={{
                background: p.highlight ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                border: p.highlight ? '2px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18, padding: '24px 20px', position: 'relative', textAlign: 'left',
              }}>
                {p.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#0f172a', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>{p.badge}</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: p.highlight ? '#10b981' : 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: p.originalPrice ? 2 : 12 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{p.desc}</span>
                </div>
                {p.originalPrice && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', marginBottom: 12 }}>
                    通常 {p.originalPrice}/月
                  </div>
                )}
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ color: '#10b981', fontSize: 13 }}>✓</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{f}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <a
            href="https://redirect.tsuratsura.com/login?tab=signup"
            style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #10b981, #38f9d7)',
              color: '#0f172a', fontWeight: 800, fontSize: 16, padding: '16px 48px',
              borderRadius: 14, textDecoration: 'none', boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
            }}
          >
            無料アカウントを作成
          </a>
          <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            クレジットカード不要 · いつでもキャンセル可
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer style={{ background: '#0a0f1e', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(to bottom, #43e97b, #10b981)' }} />
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', color: '#ffffff' }}>
            PIVO<span style={{ color: '#10b981' }}>LINK</span>
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          株式会社TSURATSURA · 大阪府大阪市天王寺区 ·{' '}
          <a href="https://redirect.tsuratsura.com" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
            redirect.tsuratsura.com
          </a>
        </div>
      </footer>
    </div>
  )
}
