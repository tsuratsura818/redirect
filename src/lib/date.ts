// 日本時間(Asia/Tokyo)基準の日付ユーティリティ。
// Vercel/Lambda はサーバーが UTC のため、日別集計などは必ずこれを使う。

/** 指定日時(既定: 現在)の JST 日付を "YYYY-MM-DD" で返す */
export function jstDateString(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}
