/**
 * サイトのURLをここ一箇所に集約する。
 *
 * ブランド名がドメインに出ないため `redirect.tsuratsura.com` から
 * `pivolink.tsuratsura.com` へ移行中。DNS 切替が済むまでは
 * NEXT_PUBLIC_BASE_URL が旧ドメインのままなので、挙動は一切変わらない。
 * 切替は環境変数を差し替えるだけで完了する。
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://redirect.tsuratsura.com').replace(/\/+$/, '')

/** 表示用のホスト名（プロトコル無し） */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '')

/**
 * 既に印刷・設置されているQRコード / NFCタグが焼き込んでいるドメイン。
 * ここを指す `/r/[slug]` は**永久に受け続ける**。廃止すると発行済みの現物が全部死ぬ。
 */
export const LEGACY_REDIRECT_ORIGIN = 'https://redirect.tsuratsura.com'
