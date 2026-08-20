import Script from 'next/script'

/**
 * 計測は Google タグマネージャー（GTM）を親にする。
 *
 * GA4（G-EDCE78KLS3）は **GTMコンテナ側の「Google タグ」から発火**する。
 * したがってここで gtag.js を直接読み込んではいけない。**入れると二重計上になる。**
 * 広告タグや追加イベントを足すときも、コードではなくGTM側で設定する。
 *
 * コンテナIDは環境変数で渡す。未設定なら何も出力しないので、
 * ローカル開発やプレビューデプロイの分が本番の数字に混ざらない。
 */
export default function Analytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  if (!gtmId) return null

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}
