import { setLangAction } from "@/app/actions";
import { ui } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

/**
 * 参加者UIの外枠。モックアップの .phone / .app-head をそのまま移植。
 * デスクトップでは端末フレーム、900px以下では全画面（自治体提案でPC表示するため両対応）。
 */
export function VisitorShell({
  lang,
  languages,
  stampCount,
  demo,
  returnTo,
  children,
}: {
  lang: Lang;
  languages: Lang[];
  stampCount: number;
  demo: boolean;
  returnTo: string;
  children: React.ReactNode;
}) {
  const t = ui(lang);

  return (
    <div className="visitor" lang={lang}>
      <div className="stage">
        <div className="phone">
          <div className="app-head">
            <div className="brand">
              まわりみち
              <small>{t.brandSub}</small>
            </div>
            <div className="head-tools">
              {languages.map((code) => (
                <form key={code} action={setLangAction}>
                  <input type="hidden" name="lang" value={code} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <button
                    className="lang-btn"
                    type="submit"
                    aria-pressed={lang === code}
                    lang={code}
                  >
                    {code.toUpperCase()}
                  </button>
                </form>
              ))}
              {/*
                ★可視テキスト（個数）が読み上げ名に含まれていないと
                  「ラベルと読み上げ名が一致しない」で落ちる（Lighthouseで実際に検出）。
                  絵文字は装飾なので読み上げから外す。
              */}
              <a className="book-btn" href="/book" aria-label={`${t.bookT} ${stampCount}`}>
                <span aria-hidden="true">📖</span>
                <span className="book-count">{stampCount}</span>
              </a>
            </div>
          </div>
          {demo ? <div className="demo-band">{t.demoBand}</div> : null}
          <div className="screen">{children}</div>
        </div>
      </div>
    </div>
  );
}
