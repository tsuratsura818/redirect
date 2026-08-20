/**
 * 日時ユーティリティ。
 * ★ toISOString() 系は UTC なので JST 早朝に1日ズレる。日付・時刻は必ずここを通す。
 */

const TZ = "Asia/Tokyo";

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hour: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** JST の「時」(0-23) */
export function hourJst(date: Date = new Date()): number {
  return Number(hourFormatter.format(date));
}

/** JST の YYYY-MM-DD */
export function dateJst(date: Date = new Date()): string {
  return dateFormatter.format(date);
}
