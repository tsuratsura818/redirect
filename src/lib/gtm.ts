/**
 * GTMのdataLayerへイベントを送るための唯一の入口。
 *
 * 計測タグの発火はすべてGTM側で設定する。ここは「何が起きたか」を宣言するだけで、
 * どこへ送るか（GA4か広告か）はコードの関心事にしない。
 * gtag を直接呼ぶと GTM 経由の計測と二重計上になるので、絶対に足さないこと。
 */

type GtmEvent =
  /** 新規登録が完了した */
  | 'sign_up'
  /** 有料プランの申込に進んだ（Stripeへ遷移する直前） */
  | 'begin_checkout'
  /** QR / NFC リンクを新規作成した */
  | 'qr_create'
  /** 法人・自治体から企画相談が送られた（本命のコンバージョン） */
  | 'consult_request'

interface DataLayerWindow extends Window {
  dataLayer?: Record<string, unknown>[]
}

export function pushEvent(event: GtmEvent, params: Record<string, string | number> = {}) {
  if (typeof window === 'undefined') return
  const w = window as DataLayerWindow
  // GTM未読み込み（ローカル開発など）でも落ちないように配列を用意しておく
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...params })
}
