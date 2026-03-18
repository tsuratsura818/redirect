'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const TOTAL = 30
const FPS = 30

// 各シーンの時間範囲
const SCENES = {
  lp:        { start: 0,  end: 8 },
  qrNew:     { start: 8,  end: 15 },
  qrDetail:  { start: 15, end: 21 },
  analytics: { start: 21, end: 28 },
  end:       { start: 28, end: 30 },
}

function inScene(t: number, key: keyof typeof SCENES) {
  return t >= SCENES[key].start && t < SCENES[key].end
}
function sceneProgress(t: number, key: keyof typeof SCENES) {
  const { start, end } = SCENES[key]
  return Math.max(0, Math.min(1, (t - start) / (end - start)))
}
function fade(t: number, inTime: number, outTime?: number) {
  const fadeIn  = Math.min(1, (t - inTime) / 0.4)
  const fadeOut = outTime ? Math.max(0, 1 - (t - outTime) / 0.3) : 1
  return Math.max(0, Math.min(1, fadeIn)) * fadeOut
}

// タイピングアニメーション
function typeText(full: string, t: number, start: number, duration: number) {
  const progress = Math.max(0, Math.min(1, (t - start) / duration))
  return full.slice(0, Math.floor(full.length * progress))
}

export default function DemoPage() {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [recording, setRecording] = useState(false)
  const rafRef = useRef<number>(0)
  const lastRef = useRef<number>(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tick = useCallback((now: number) => {
    if (!lastRef.current) lastRef.current = now
    const delta = (now - lastRef.current) / 1000
    lastRef.current = now
    setT(prev => {
      const next = prev + delta
      if (next >= TOTAL) { setPlaying(false); return TOTAL }
      return next
    })
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (playing) {
      lastRef.current = 0
      rafRef.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(rafRef.current)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing, tick])

  // 再生完了時に録画も停止
  useEffect(() => {
    if (!playing && recording && t >= TOTAL - 0.1) {
      if (recordTimerRef.current) clearTimeout(recordTimerRef.current)
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }, 500)
    }
  }, [playing, recording, t])

  const restart = () => { setT(0); setPlaying(true) }
  const toggle  = () => {
    if (t >= TOTAL) { restart(); return }
    setPlaying(p => !p)
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 } as MediaTrackConstraints,
        audio: false,
      })

      chunksRef.current = []
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : ''

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = mr

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'pivolink-demo.webm'
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        stream.getTracks().forEach(track => track.stop())
        setRecording(false)
      }

      mr.start(100)
      setRecording(true)
      // アニメーションを最初から再生
      setT(0)
      setPlaying(true)
      // TOTAL秒後に自動停止
      recordTimerRef.current = setTimeout(() => {
        if (mr.state === 'recording') mr.stop()
      }, (TOTAL + 1) * 1000)
    } catch {
      // キャンセルまたはエラー
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (recordTimerRef.current) clearTimeout(recordTimerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    } else {
      setRecording(false)
    }
  }, [])

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* 16:9 キャンバス */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 1280, aspectRatio: '16/9', overflow: 'hidden', background: '#fff' }}>

        {/* ── シーン1: LP ── */}
        <SceneLP t={t} />

        {/* ── シーン2: QR新規作成 ── */}
        <SceneQrNew t={t} />

        {/* ── シーン3: QR詳細 ── */}
        <SceneQrDetail t={t} />

        {/* ── シーン4: アナリティクス ── */}
        <SceneAnalytics t={t} />

        {/* ── シーン5: エンドカード ── */}
        <SceneEnd t={t} />
      </div>

      {/* コントロール */}
      <div style={{ width: '100%', maxWidth: 1280, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* プログレスバー */}
        <div
          style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, cursor: 'pointer' }}
          onClick={e => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
            setT((e.clientX - rect.left) / rect.width * TOTAL)
          }}
        >
          <div style={{ height: '100%', width: `${(t / TOTAL) * 100}%`, background: '#10b981', borderRadius: 2, transition: 'width 0.05s' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggle}
            disabled={recording}
            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: recording ? 'not-allowed' : 'pointer', opacity: recording ? 0.5 : 1 }}
          >
            {playing ? '⏸ 一時停止' : t >= TOTAL ? '↺ 最初から' : '▶ 再生'}
          </button>
          <button
            onClick={restart}
            disabled={recording}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: recording ? 'not-allowed' : 'pointer', opacity: recording ? 0.5 : 1 }}
          >
            ↺ リセット
          </button>
          {!recording ? (
            <button
              onClick={startRecording}
              style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginLeft: 8 }}
            >
              ⏺ 書き出す (.webm)
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginLeft: 8 }}
            >
              ⏹ 録画停止
            </button>
          )}
          <span style={{ color: recording ? '#ef4444' : 'rgba(255,255,255,0.5)', fontSize: 13, marginLeft: 'auto', fontWeight: recording ? 600 : 400 }}>
            {recording ? `● REC  ${Math.floor(t)}s / ${TOTAL}s` : `${Math.floor(t)}s / ${TOTAL}s`}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── LP シーン ──────────────────────────────────────────────────

function SceneLP({ t }: { t: number }) {
  const op = fade(t, SCENES.lp.start, SCENES.lp.end - 0.3)
  if (op === 0) return null
  const p = sceneProgress(t, 'lp')

  // スクロール量 (0→2400px相当をシミュレート)
  const scrollY = p * 2400

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, overflow: 'hidden', background: '#fff' }}>
      {/* ヘッダー */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid #e2e8f0', padding: '14px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <LogoMark />
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#64748b' }}>
          <span>機能</span><span>料金</span><span>ログイン</span>
          <span style={{ background: '#10b981', color: '#fff', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>無料で始める</span>
        </div>
      </div>

      {/* コンテンツ（スクロール） */}
      <div style={{ transform: `translateY(${-scrollY * 0.38}px)`, paddingTop: 56 }}>

        {/* Hero */}
        <div style={{ padding: '80px 80px 60px', background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f9f0 50%, #f0fdfa 100%)', textAlign: 'center', opacity: fade(t, 0.2) }}>
          <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '4px 16px', fontSize: 12, color: '#059669', fontWeight: 600, marginBottom: 24 }}>
            ✦ 無料プランから始められます
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: 20 }}>
            QRコード・NFCタグの<br />
            <span style={{ color: '#10b981' }}>リンク先</span>をいつでも変更
          </h1>
          <p style={{ fontSize: 18, color: '#64748b', marginBottom: 36 }}>
            印刷済みQRコードや設置済みNFCタグの遷移先を<br />管理画面からワンクリックで変更。再発行不要。
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <span style={{ background: 'linear-gradient(135deg,#10b981,#14b8a6)', color: '#fff', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16 }}>無料で始める →</span>
            <span style={{ border: '2px solid #e2e8f0', padding: '14px 32px', borderRadius: 12, fontWeight: 600, fontSize: 16, color: '#0f172a' }}>機能を見る</span>
          </div>
        </div>

        {/* 3ステップ */}
        <div style={{ padding: '64px 80px', opacity: fade(t, 1.5) }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 48 }}>3ステップで始められる</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
            {[
              { n: '01', title: 'QRを作成', desc: 'URLを入力してQRコードを自動生成。PNG/SVGでダウンロード可能。', color: '#10b981' },
              { n: '02', title: 'リンク先を設定', desc: '管理画面からリンク先URLをいつでも変更できます。', color: '#3b82f6' },
              { n: '03', title: 'アクセスを分析', desc: 'スキャン数・デバイス・地域を詳細に分析。', color: '#8b5cf6' },
            ].map(s => (
              <div key={s.n} style={{ background: '#f8fafc', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, marginBottom: 16 }}>{s.n}</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 料金プラン */}
        <div style={{ padding: '64px 80px', background: '#f8fafc', opacity: fade(t, 3.5) }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 48 }}>シンプルな料金体系</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
            {[
              { name: 'Free', price: '¥0', sub: '/月', features: ['QR/NFC 3件', '月間1,000アクセス', '基本アクセス解析'], popular: false },
              { name: 'Pro', price: '¥980', sub: '/月', features: ['QR/NFC 50件', '月間50,000アクセス', '詳細解析・全ルール機能'], popular: true },
              { name: 'Business', price: '¥4,980', sub: '/月', features: ['QR/NFC 無制限', '月間無制限アクセス', '優先サポート'], popular: false },
            ].map(plan => (
              <div key={plan.name} style={{ background: '#fff', borderRadius: 16, padding: 28, border: plan.popular ? '2px solid #10b981' : '1px solid #e2e8f0', position: 'relative' }}>
                {plan.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', borderRadius: 999, padding: '3px 14px', fontSize: 11, fontWeight: 700 }}>人気</div>}
                <div style={{ fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#0f172a' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>{plan.sub}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── QR新規作成 シーン ──────────────────────────────────────────

function SceneQrNew({ t }: { t: number }) {
  const op = fade(t, SCENES.qrNew.start, SCENES.qrNew.end - 0.3)
  if (op === 0) return null

  const name = typeText('夏メニューQR', t, 9.5, 1.2)
  const slug = typeText('summer-menu', t, 11.2, 1.0)
  const url  = typeText('https://example.com/menu-summer', t, 12.5, 1.8)
  const showBtn = t > 14.2
  const clicking = t > 14.5 && t < 15

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <DashboardHeader />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="qr" />
        <div style={{ flex: 1, padding: '40px 56px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: '#94a3b8' }}>
            <span>← QR / NFC 一覧</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 32 }}>新規作成</h1>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 40, maxWidth: 600 }}>
            <FormField label="名前" required value={name} placeholder="例: 店頭QRコード" />
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>スラッグ <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 10, overflow: 'hidden', background: t > 11 ? '#fff' : '#f9fafb' }}>
                <span style={{ padding: '12px 14px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>/r/</span>
                <span style={{ padding: '12px 16px', fontSize: 14, color: '#0f172a', flex: 1, minHeight: 20 }}>{slug}{t > 11 && t < 12.2 ? '|' : ''}</span>
              </div>
            </div>
            <FormField label="リンク先URL" required value={url} placeholder="https://example.com" />

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button style={{ background: clicking ? '#059669' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer', transform: clicking ? 'scale(0.97)' : 'scale(1)', transition: 'all 0.1s' }}>
                作成する
              </button>
              <button style={{ background: '#fff', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: 10, padding: '13px 24px', fontSize: 14, cursor: 'pointer' }}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── QR詳細 シーン ──────────────────────────────────────────────

function SceneQrDetail({ t }: { t: number }) {
  const op = fade(t, SCENES.qrDetail.start, SCENES.qrDetail.end - 0.3)
  if (op === 0) return null

  const editingUrl = t > 18.0
  const newUrl = typeText('https://example.com/menu-autumn', t, 18.2, 1.5)
  const saved = t > 20.2

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <DashboardHeader />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="qr" />
        <div style={{ flex: 1, padding: '40px 56px', overflowY: 'auto' }}>
          {/* ヘッダー */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>夏メニューQR</h1>
                <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>有効</span>
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>/r/summer-menu</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>PNG</button>
              <button style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>SVG</button>
            </div>
          </div>

          {/* カード */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, marginBottom: 24 }}>
            {/* QRコードプレビュー */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <QRMock size={140} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>スキャンしてテスト</span>
            </div>
            {/* 情報 */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <InfoRow label="スラッグ" value="/r/summer-menu" />
                <InfoRow label="アクセス数" value="247" />
                <InfoRow label="作成日" value="2026/03/18" />
                <InfoRow label="ステータス" value="有効" />
              </div>
              {/* リンク先URL */}
              <div style={{ marginTop: 20 }}>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>リンク先URL</label>
                <div style={{ border: editingUrl ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', fontSize: 14, color: '#0f172a', background: editingUrl ? '#f0fdf4' : '#fff', transition: 'all 0.2s' }}>
                  {editingUrl ? newUrl : 'https://example.com/menu-summer'}
                  {editingUrl && t < 19.7 ? '|' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* 保存ボタン & 成功メッセージ */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 14 }}>
              保存する
            </button>
            {saved && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, opacity: fade(t, 20.2) }}>
                ✓ 保存しました
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── アナリティクス シーン ──────────────────────────────────────

const DAILY_DATA = [
  { date: '03/12', count: 28 },
  { date: '03/13', count: 45 },
  { date: '03/14', count: 38 },
  { date: '03/15', count: 62 },
  { date: '03/16', count: 89 },
  { date: '03/17', count: 74 },
  { date: '03/18', count: 56 },
]
const MAX_COUNT = 89

function SceneAnalytics({ t }: { t: number }) {
  const op = fade(t, SCENES.analytics.start, SCENES.analytics.end - 0.3)
  if (op === 0) return null
  const p = sceneProgress(t, 'analytics')

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <DashboardHeader />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active="qr" />
        <div style={{ flex: 1, padding: '36px 48px', overflowY: 'auto' }}>
          {/* タブ */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e2e8f0', marginBottom: 28 }}>
            {['概要', 'ルール', 'アナリティクス', 'クッション', '履歴'].map(tab => (
              <div key={tab} style={{
                padding: '10px 20px', fontSize: 13, fontWeight: 600,
                color: tab === 'アナリティクス' ? '#10b981' : '#94a3b8',
                borderBottom: tab === 'アナリティクス' ? '2px solid #10b981' : '2px solid transparent',
                cursor: 'pointer',
              }}>{tab}</div>
            ))}
          </div>

          {/* 合計スキャン */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
              合計 <span style={{ color: '#10b981' }}>1,247</span> スキャン
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['7日間', '14日間', '30日間', '90日間'].map(d => (
                <span key={d} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: d === '7日間' ? '#10b981' : '#f1f5f9', color: d === '7日間' ? '#fff' : '#64748b' }}>{d}</span>
              ))}
            </div>
          </div>

          {/* 日別グラフ */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 28px', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 20 }}>日別スキャン数</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160, paddingBottom: 24, borderBottom: '1px solid #f1f5f9' }}>
              {DAILY_DATA.map((d, i) => {
                const barProgress = Math.max(0, Math.min(1, (p - i * 0.08) / 0.3))
                const height = (d.count / MAX_COUNT) * 140 * barProgress
                return (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: '100%', background: '#3b82f6', borderRadius: '4px 4px 0 0', height, transition: 'height 0.1s', minHeight: 0 }} />
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{d.date}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* デバイス & OS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* デバイス */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 20 }}>デバイス</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'モバイル', pct: 68, color: '#3b82f6' },
                  { label: 'デスクトップ', pct: 24, color: '#6366f1' },
                  { label: 'タブレット', pct: 8, color: '#8b5cf6' },
                ].map(d => (
                  <div key={d.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', marginBottom: 6 }}>
                      <span>{d.label}</span><span style={{ fontWeight: 600 }}>{d.pct}%</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999 }}>
                      <div style={{ height: '100%', width: `${d.pct}%`, background: d.color, borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OS */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 20 }}>OS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'iOS', count: 524, color: '#10b981' },
                  { label: 'Android', count: 328, color: '#f59e0b' },
                  { label: 'Windows', count: 248, color: '#3b82f6' },
                  { label: 'macOS', count: 147, color: '#8b5cf6' },
                ].map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{d.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── エンドカード ──────────────────────────────────────────────

function SceneEnd({ t }: { t: number }) {
  const op = fade(t, SCENES.end.start)
  if (op === 0) return null

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 14, height: 88, borderRadius: 7, background: 'linear-gradient(to bottom, #43e97b, #38f9d7)' }} />
        <span style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-2px', color: '#0f172a' }}>
          <span style={{ color: '#fff' }}>PIVO</span>
          <span style={{ color: '#10b981' }}>LINK</span>
        </span>
      </div>
      <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>
        redirect.tsuratsura.com
      </div>
      <div style={{ marginTop: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '8px 24px', fontSize: 14, color: '#10b981', fontWeight: 600 }}>
        無料プランから始める
      </div>
    </div>
  )
}

// ─── 共通UIコンポーネント ──────────────────────────────────────

function LogoMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(to bottom,#43e97b,#38f9d7)', marginRight: 8 }} />
      <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '0.04em', color: '#0f172a' }}>
        PIVO<span style={{ color: '#10b981' }}>LINK</span>
      </span>
    </div>
  )
}

function DashboardHeader() {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <LogoMark />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
      </div>
    </div>
  )
}

function Sidebar({ active }: { active: string }) {
  return (
    <div style={{ width: 220, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
      {[
        { id: 'dashboard', label: 'ダッシュボード', icon: '◻' },
        { id: 'qr', label: 'QR / NFC 一覧', icon: '⊞' },
        { id: 'plan', label: 'プラン管理', icon: '◈' },
        { id: 'guide', label: 'ガイド', icon: '?' },
      ].map(item => (
        <div key={item.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: item.id === active ? '#f0fdf4' : 'transparent',
          color: item.id === active ? '#059669' : '#64748b',
        }}>
          <span>{item.icon}</span>{item.label}
        </div>
      ))}
    </div>
  )
}

function FormField({ label, required, value, placeholder }: { label: string; required?: boolean; value: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div style={{ border: value ? '2px solid #10b981' : '1px solid #d1d5db', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#0f172a', background: value ? '#f0fdf4' : '#fff', minHeight: 20, transition: 'all 0.2s' }}>
        {value || <span style={{ color: '#cbd5e1' }}>{placeholder}</span>}
        {value ? '|' : ''}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{value}</div>
    </div>
  )
}

function QRMock({ size }: { size: number }) {
  const cell = size / 21
  const pattern: number[] = []
  for (let i = 0; i < 21 * 21; i++) {
    const r = Math.floor(i / 21)
    const c = i % 21
    const inCorner = (r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7)
    pattern.push(inCorner || ((r + c + i * 7) % 3 === 0) ? 1 : 0)
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(21, ${cell}px)`, width: size, height: size, gap: 0 }}>
      {pattern.map((v, i) => (
        <div key={i} style={{ width: cell, height: cell, background: v ? '#0f172a' : '#fff' }} />
      ))}
    </div>
  )
}
