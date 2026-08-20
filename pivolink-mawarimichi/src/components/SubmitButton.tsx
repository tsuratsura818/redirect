"use client";

import { useFormStatus } from "react-dom";

/**
 * 送信中が見えるボタン。
 *
 * ★これが無いと「押しても反応しない」と言われる。
 *   Server Action はサーバーで処理してから画面を差し替えるので、
 *   押してから表示が変わるまでに間がある。その間なにも変わらないと、
 *   参加者は「壊れている」と判断してもう一度押す（＝二重送信）。
 *   実測でこの間が4.5秒あり、実際に指摘を受けた。
 */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  style,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      style={style}
      disabled={pending}
      aria-busy={pending}
      data-pending={pending ? "1" : undefined}
    >
      {pending ? (
        <span className="btn-pending">
          <i className="spin" aria-hidden="true" />
          {pendingLabel ?? "ちょっと待ってね…"}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
