"use client";

/**
 * ナビのディープリンク。タップを scans.nav_clicked に記録してから地図アプリを開く。
 * 記録は sendBeacon なので、遷移でリクエストが切られても落ちない。
 *
 * ★アイコンは絵文字（🧭）ではなくインラインSVG。
 *   絵文字は端末のフォントで形も色も変わり、Androidでは平たい別物になる。
 *   ブランドの中で1つだけ他所の絵が混ざる状態になるので使わない。
 */
function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.4 8.6 10.9 10.9 8.6 15.4 13.1 13.1z" fill="currentColor" />
    </svg>
  );
}
export function NavDeepLink({
  href,
  spotId,
  label,
}: {
  href: string;
  /** 記録対象のスポット（＝いま立っているスポット）。無い場合は記録しない */
  spotId: string | null;
  label: string;
}) {
  return (
    <a
      className="nav-link"
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => {
        if (!spotId) return;
        navigator.sendBeacon?.("/api/nav-click", JSON.stringify({ spotId }));
      }}
    >
      <CompassIcon />
      <span>{label}</span>
    </a>
  );
}
