'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/* ─── CSS ─────────────────────────────────────────────────────── */
const CSS = `
  @keyframes hero-fade {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes float-orb {
    0%,100% { transform:translate(0,0); }
    50%     { transform:translate(-30px,20px); }
  }
  @keyframes badge-pop {
    from { opacity:0; transform:scale(0.85); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes reveal-up {
    from { opacity:0; transform:translateY(36px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    from { background-position:200% center; }
    to   { background-position:-200% center; }
  }
  .hero-h { animation:hero-fade 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .hero-p { animation:hero-fade 0.9s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
  .hero-c { animation:hero-fade 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
  .hero-b { animation:badge-pop 0.6s cubic-bezier(0.16,1,0.3,1) 0s both; }
  .in-view { animation:reveal-up 0.75s cubic-bezier(0.16,1,0.3,1) both; }
  .prob-card {
    background:#fff; border:1px solid #e2e8f0; border-radius:18px;
    padding:24px 22px; display:flex; gap:18px; align-items:flex-start;
    box-shadow:0 2px 16px rgba(0,0,0,0.05);
    transition:transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s;
  }
  .prob-card:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,0.1); }
  .feat-card {
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
    border-radius:16px; padding:22px 20px;
    transition:background 0.2s, border-color 0.2s, transform 0.25s cubic-bezier(0.16,1,0.3,1);
  }
  .feat-card:hover { background:rgba(255,255,255,0.09); border-color:rgba(16,185,129,0.35); transform:translateY(-3px); }
  .cta-btn {
    display:inline-block; font-weight:800; text-decoration:none;
    padding:18px 52px; border-radius:16px; font-size:17px;
    background:linear-gradient(135deg,#10b981,#38f9d7);
    color:#0f172a; letter-spacing:0.01em;
    box-shadow:0 8px 32px rgba(16,185,129,0.4);
    transition:transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s;
  }
  .cta-btn:hover { transform:translateY(-3px); box-shadow:0 16px 48px rgba(16,185,129,0.55); }
  .plan-card {
    border-radius:20px; padding:28px 24px;
    transition:transform 0.25s cubic-bezier(0.16,1,0.3,1);
  }
  .plan-card:hover { transform:translateY(-4px); }
`

/* ─── スクロールアニメーションフック ──────────────────────────── */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.unobserve(el) }
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{
      animationDelay: `${delay}ms`,
      ...(visible ? {} : { opacity: 0 }),
      ...(visible ? { animation: `reveal-up 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms both` } : {}),
    }}>
      {children}
    </div>
  )
}

/* ─── カウントアップ ─────────────────────────────────────────── */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.unobserve(el)
      let start: number | null = null
      const duration = 1400
      const step = (ts: number) => {
        if (!start) start = ts
        const pct = Math.min((ts - start) / duration, 1)
        const ease = 1 - Math.pow(1 - pct, 4)
        setVal(Math.round(ease * to))
        if (pct < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ─── データ ─────────────────────────────────────────────────── */
const problems = [
  { icon: '🖨️', title: 'キャンペーンのたびに刷り直し', desc: 'チラシや名刺のQRコード、URLが変わるたびに印刷費と手間が発生していませんか？' },
  { icon: '📦', title: '商品パッケージがリンク切れ',  desc: 'ECサイト移転・商品ページ変更で、配布済みQRが404になってしまう。' },
  { icon: '🏪', title: 'NFCタグを毎月書き換える',    desc: '店頭や客室のNFCを季節・キャンペーンごとに書き換える手間と人件費。' },
]
const befores = ['URLが変わったら刷り直し', 'NFCを毎回書き換え', 'QRコードは使い捨て', 'リンク切れを放置']
const afters  = ['URLは管理画面から即変更', 'NFCタグは設置したまま', 'QRを何年でも使い続ける', '常に正しいページへ誘導']
const features = [
  { icon: '🔗', title: 'URL即時変更',    desc: '管理画面からワンクリック。変更は即時反映。' },
  { icon: '📅', title: 'スケジュール切替', desc: '指定日時に自動でリンク先を切り替え。' },
  { icon: '📱', title: 'デバイス別振分',  desc: 'iOS・Android・PCで異なるページへ。' },
  { icon: '🔀', title: 'A/Bテスト',      desc: 'トラフィック分割で効果を比較検証。' },
  { icon: '📊', title: 'アクセス解析',   desc: 'スキャン数・デバイス・地域をリアルタイム確認。' },
  { icon: '🎫', title: 'クッションページ', desc: '遷移前にクーポンやお知らせを表示。' },
]

/* ─── ページ ─────────────────────────────────────────────────── */
export default function EventPage() {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ fontFamily: "'Inter','Hiragino Kaku Gothic ProN',sans-serif", color: '#0f172a', overflowX: 'hidden' }}>

        {/* ── ヘッダー ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(8,15,26,0.85)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 26, borderRadius: 2, background: 'linear-gradient(to bottom,#43e97b,#10b981)' }} />
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
              PIVO<span style={{ color: '#10b981' }}>LINK</span>
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 4, padding: '2px 5px' }}>β</span>
          </div>
          <a href="https://redirect.tsuratsura.com/login?tab=signup"
            style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', background: '#10b981', padding: '9px 18px', borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'box-shadow 0.2s' }}>
            無料で始める →
          </a>
        </header>

        {/* ── Hero ── */}
        <section style={{
          background: 'linear-gradient(160deg,#080f1a 0%,#0f2027 50%,#080f1a 100%)',
          padding: 'clamp(72px,12vw,120px) 24px clamp(80px,14vw,140px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          {/* 装飾オーブ */}
          <div style={{ position:'absolute', top:'-20%', right:'-8%', width:560, height:560, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.18) 0%,transparent 65%)', animation:'float-orb 20s ease-in-out infinite', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-15%', left:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(56,249,215,0.1) 0%,transparent 65%)', animation:'float-orb 28s ease-in-out infinite reverse', pointerEvents:'none' }} />
          {/* グリッド */}
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }} />

          <div style={{ position:'relative', zIndex:1, maxWidth:640, margin:'0 auto' }}>
            <div className="hero-b" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.35)', borderRadius:999, padding:'7px 18px', marginBottom:32 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block', boxShadow:'0 0 8px #10b981' }} />
              <span style={{ color:'#10b981', fontSize:13, fontWeight:700, letterSpacing:'0.06em' }}>交流会 特別ご案内</span>
            </div>

            <h1 className="hero-h" style={{ fontSize:'clamp(32px,7vw,52px)', fontWeight:900, color:'#fff', lineHeight:1.15, margin:'0 0 20px', letterSpacing:'-0.025em' }}>
              QRコードを<br />
              <span style={{
                background:'linear-gradient(135deg,#43e97b,#38f9d7)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>「資産」</span>に変える
            </h1>

            <p className="hero-p" style={{ fontSize:'clamp(15px,3vw,18px)', color:'rgba(255,255,255,0.6)', lineHeight:1.8, margin:'0 0 44px', maxWidth:520, marginLeft:'auto', marginRight:'auto' }}>
              印刷したQRコードも、設置したNFCタグも、<br />
              リンク先を管理画面からいつでも変更できます。<br />
              再印刷・再設置は<strong style={{ color:'rgba(255,255,255,0.9)' }}>一切不要</strong>。
            </p>

            <div className="hero-c" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
              <a href="https://redirect.tsuratsura.com/login?tab=signup" className="cta-btn">
                無料アカウントを作成
              </a>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>クレジットカード不要 · 即日開始 · いつでも解約</div>
            </div>
          </div>
        </section>

        {/* ── 数字で見る ── */}
        <section style={{ background:'#fff', borderBottom:'1px solid #f1f5f9' }}>
          <div style={{ maxWidth:720, margin:'0 auto', padding:'48px 24px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, textAlign:'center' }}>
            {[
              { num: 50000, suffix:'+', label:'月間スキャン数対応' },
              { num: 3, suffix:'クリック', label:'でURL変更完了' },
              { num: 0, suffix:'円', label:'Free プラン（CC不要）' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <div style={{ fontSize:'clamp(28px,5vw,40px)', fontWeight:900, color:'#0f172a', lineHeight:1, marginBottom:6 }}>
                  <CountUp to={s.num} suffix={s.suffix} />
                </div>
                <div style={{ fontSize:13, color:'#64748b' }}>{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── 課題 ── */}
        <section style={{ background:'#f8fafc', padding:'80px 24px' }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            <Reveal>
              <div style={{ textAlign:'center', marginBottom:48 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#10b981', letterSpacing:'0.12em', marginBottom:10 }}>THE PROBLEM</div>
                <h2 style={{ fontSize:'clamp(24px,5vw,36px)', fontWeight:800, margin:0, letterSpacing:'-0.02em' }}>こんな経験、ありませんか？</h2>
              </div>
            </Reveal>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {problems.map((p, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="prob-card">
                    <div style={{ fontSize:32, lineHeight:1, flexShrink:0, marginTop:2 }}>{p.icon}</div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, marginBottom:5 }}>{p.title}</div>
                      <div style={{ fontSize:14, color:'#64748b', lineHeight:1.65 }}>{p.desc}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── ソリューション ── */}
        <section style={{ background:'linear-gradient(160deg,#0a0f1a 0%,#0f2027 100%)', padding:'80px 24px' }}>
          <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center' }}>
            <Reveal>
              <div style={{ fontSize:11, fontWeight:700, color:'#10b981', letterSpacing:'0.12em', marginBottom:10 }}>THE SOLUTION</div>
              <h2 style={{ fontSize:'clamp(24px,5vw,38px)', fontWeight:900, color:'#fff', margin:'0 0 16px', letterSpacing:'-0.02em', lineHeight:1.2 }}>
                Pivolinkで、QRを<br />
                <span style={{ background:'linear-gradient(135deg,#43e97b,#38f9d7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>「ずっと使える資産」</span>に
              </h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.8, margin:'0 0 56px' }}>
                Pivolinkが発行するURLをQR・NFCに設定するだけ。<br />リンク先の変更は、管理画面から3クリックで完了します。
              </p>
            </Reveal>

            {/* Before / After */}
            <Reveal delay={100}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {/* Before */}
                <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:18, padding:'22px 18px', textAlign:'left' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#ef4444', letterSpacing:'0.1em', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(239,68,68,0.2)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:8 }}>✕</span>
                    BEFORE
                  </div>
                  {befores.map(t => (
                    <div key={t} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:10 }}>
                      <span style={{ color:'#ef4444', fontSize:13, flexShrink:0, marginTop:1 }}>✕</span>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.5 }}>{t}</span>
                    </div>
                  ))}
                </div>
                {/* After */}
                <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:18, padding:'22px 18px', textAlign:'left' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#10b981', letterSpacing:'0.1em', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:16, height:16, borderRadius:'50%', background:'rgba(16,185,129,0.2)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:8 }}>✓</span>
                    AFTER
                  </div>
                  {afters.map(t => (
                    <div key={t} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:10 }}>
                      <span style={{ color:'#10b981', fontSize:13, flexShrink:0, marginTop:1 }}>✓</span>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.85)', lineHeight:1.5 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 機能 ── */}
        <section style={{ background:'#0f172a', padding:'80px 24px' }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            <Reveal>
              <div style={{ textAlign:'center', marginBottom:44 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#10b981', letterSpacing:'0.12em', marginBottom:10 }}>FEATURES</div>
                <h2 style={{ fontSize:'clamp(22px,5vw,32px)', fontWeight:800, color:'#fff', margin:0 }}>主な機能</h2>
              </div>
            </Reveal>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:12 }}>
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <div className="feat-card" style={{ height:'100%' }}>
                    <div style={{ fontSize:26, marginBottom:12 }}>{f.icon}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:6 }}>{f.title}</div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>{f.desc}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 料金 ── */}
        <section style={{ background:'linear-gradient(160deg,#080f1a 0%,#0f2027 100%)', padding:'80px 24px' }}>
          <div style={{ maxWidth:580, margin:'0 auto', textAlign:'center' }}>
            <Reveal>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.35)', borderRadius:999, padding:'7px 18px', marginBottom:20 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block' }} />
                <span style={{ color:'#10b981', fontSize:13, fontWeight:700 }}>交流会ご参加の方へ</span>
              </div>
              <h2 style={{ fontSize:'clamp(22px,5vw,34px)', fontWeight:900, color:'#fff', margin:'0 0 12px', letterSpacing:'-0.02em' }}>
                ベータ期間中は<br />全プラン <span style={{ background:'linear-gradient(135deg,#43e97b,#38f9d7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>20% OFF</span>
              </h2>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', marginBottom:48, lineHeight:1.8 }}>
                正式リリース前の特別価格。Freeプランはクレカ不要で今すぐ開始できます。
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:44 }}>
                {/* Free */}
                <div className="plan-card" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', textAlign:'left' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.4)', marginBottom:10 }}>Free</div>
                  <div style={{ fontSize:36, fontWeight:900, color:'#fff', lineHeight:1, marginBottom:20 }}>¥0</div>
                  {['リンク3件', '月間1,000スキャン', 'QRコード生成'].map(f => (
                    <div key={f} style={{ display:'flex', gap:8, marginBottom:8 }}>
                      <span style={{ color:'#10b981' }}>✓</span>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                {/* Pro */}
                <div className="plan-card" style={{ background:'rgba(16,185,129,0.1)', border:'2px solid rgba(16,185,129,0.5)', textAlign:'left', position:'relative' }}>
                  <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#10b981,#38f9d7)', color:'#0f172a', fontSize:10, fontWeight:800, padding:'4px 12px', borderRadius:999, whiteSpace:'nowrap' }}>
                    交流会特別価格
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#10b981', marginBottom:10 }}>Pro</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:4 }}>
                    <span style={{ fontSize:36, fontWeight:900, color:'#fff', lineHeight:1 }}>¥780</span>
                    <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>/月</span>
                  </div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'line-through', marginBottom:16 }}>通常 ¥980/月</div>
                  {['リンク50件', '月間50,000スキャン', '全ルール機能', 'A/Bテスト・スケジュール'].map(f => (
                    <div key={f} style={{ display:'flex', gap:8, marginBottom:8 }}>
                      <span style={{ color:'#10b981' }}>✓</span>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <a href="https://redirect.tsuratsura.com/login?tab=signup" className="cta-btn">
                無料アカウントを作成
              </a>
              <div style={{ marginTop:16, fontSize:13, color:'rgba(255,255,255,0.3)' }}>
                クレジットカード不要 · いつでもキャンセル可
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── フッター ── */}
        <footer style={{ background:'#040810', padding:'28px 24px', textAlign:'center' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
            <div style={{ width:3, height:20, borderRadius:2, background:'linear-gradient(to bottom,#43e97b,#10b981)' }} />
            <span style={{ fontSize:15, fontWeight:800, letterSpacing:'0.04em', color:'#fff' }}>
              PIVO<span style={{ color:'#10b981' }}>LINK</span>
            </span>
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>
            株式会社TSURATSURA · 大阪府大阪市天王寺区 ·{' '}
            <a href="https://redirect.tsuratsura.com" style={{ color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>redirect.tsuratsura.com</a>
          </div>
        </footer>
      </div>
    </>
  )
}
