interface SeedPost {
  content: string
  category: string
  post_number: number
  hashtags: string[]
}

const BASE = 'https://redirect.tsuratsura.com'
const LP = `${BASE}/lp`
const LP_REST = `${LP}/restaurant`
const LP_RE = `${LP}/realestate`
const LP_EC = `${LP}/ec`
const LP_EVT = `${LP}/event`

export const SEED_POSTS: SeedPost[] = [
  // ===== A: サービス紹介（日本語 #1-15） =====
  {
    post_number: 1,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', 'NFCタグ'],
    content: `印刷したQRコード、URLが変わったらどうしますか？

答え：刷り直さなくていい。

Pivolinkなら、印刷済みQRコード・設置済みNFCタグのリンク先を管理画面からいつでも変更できます。

無料プランあり。今すぐ始められます。
${BASE}

#Pivolink #QRコード #NFCタグ #DX`,
  },
  {
    post_number: 2,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', 'リダイレクト'],
    content: `「QRコードは印刷したら変えられない」

それ、もう過去の話です。

Pivolinkを使えば、QRコードの中身はそのまま、飛び先だけを自由に変更。印刷コストゼロで、キャンペーンもメニューも自在に切替。

${BASE}

#Pivolink #QRコード #リダイレクト #コスト削減`,
  },
  {
    post_number: 3,
    category: 'service_intro',
    hashtags: ['Pivolink', 'NFCタグ', 'NFC'],
    content: `NFCタグ、貼ったら終わりだと思ってませんか？

Pivolinkなら：
✅ タグの飛び先をいつでも変更
✅ アクセス解析でタッチ数を把握
✅ 時間帯・デバイス別に振り分け

1枚数十円のNFCタグが、永久に使えるマーケティングツールに。

${BASE}

#Pivolink #NFCタグ #NFC #スマートタグ`,
  },
  {
    post_number: 4,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', 'アクセス解析'],
    content: `QRコード、何回スキャンされたか知ってますか？

Pivolinkなら：
📊 日別・時間帯別アクセス数
📱 デバイス・OS・ブラウザ別分析
🌍 地域別データ

「なんとなく」を「データで」に変えましょう。

${BASE}

#Pivolink #QRコード #アクセス解析 #マーケティング`,
  },
  {
    post_number: 5,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', 'ABテスト'],
    content: `同じQRコードで、A/Bテストができるって知ってました？

Pivolinkなら、1つのQRで複数のURLにトラフィックを分割。

「LP-AとLP-B、どっちが効く？」をリアルタイムで検証。

印刷物のA/Bテスト、始めませんか？

${BASE}

#Pivolink #QRコード #ABテスト #マーケティング #CRO`,
  },
  {
    post_number: 6,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', 'スケジュール'],
    content: `QRコードのリンク先、時間で自動切替できます。

例えば：
🌅 朝 → モーニングメニュー
🌞 昼 → ランチメニュー
🌙 夜 → ディナーメニュー

1枚のQRで、時間帯に合わせた最適な体験を。

${LP_REST}

#Pivolink #QRコード #スケジュール #飲食店DX`,
  },
  {
    post_number: 7,
    category: 'service_intro',
    hashtags: ['Pivolink', 'NFCタグ', 'QRコード', '無料'],
    content: `Pivolink、無料で始められます。

🆓 Freeプラン：5リンクまで
💼 Pro：¥980/月（無制限）
🏢 Business：¥4,980/月（チーム管理・API）

まずは無料で試して、効果を実感してから拡張。

${BASE}/login

#Pivolink #QRコード #NFCタグ #無料 #SaaS`,
  },
  {
    post_number: 8,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', 'デバイス別'],
    content: `同じQRコードなのに、iPhoneとAndroidで違うページに飛ばせます。

✅ iPhone → App Storeへ
✅ Android → Google Playへ
✅ PC → Webサイトへ

デバイス別リダイレクト、Pivolinkなら設定3分。

${BASE}

#Pivolink #QRコード #デバイス別 #アプリ誘導`,
  },
  {
    post_number: 9,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', 'クッションページ'],
    content: `QRコードの飛び先が変わったこと、ユーザーに伝えたい？

Pivolinkの「クッションページ」機能：
📢 リダイレクト前にお知らせを表示
🎨 ロゴ・メッセージをカスタマイズ
⏱️ 自動転送の秒数を設定

サイト移転、キャンペーン終了のお知らせに最適。

${BASE}

#Pivolink #QRコード #クッションページ`,
  },
  {
    post_number: 10,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', 'NFCタグ', '多言語'],
    content: `外国人観光客が増えている今、QRコードも多言語対応しませんか？

Pivolinkなら：
🇯🇵 日本語ユーザー → 日本語ページ
🇺🇸 英語ユーザー → 英語ページ
🇨🇳 中国語ユーザー → 中国語ページ

1枚のQRで、世界中のお客様に最適な体験を。

${BASE}

#Pivolink #QRコード #NFCタグ #インバウンド #多言語`,
  },

  // ===== B: 課題提起・共感（日本語 #11-25） =====
  {
    post_number: 11,
    category: 'pain_point',
    hashtags: ['Pivolink', 'QRコード', 'コスト削減'],
    content: `QRコードの印刷代、年間いくらかかってますか？

キャンペーンごとに新しいQR → チラシ再印刷 → 配布…

Pivolinkなら、1回印刷したQRの飛び先を何度でも変更。印刷コストをゼロに。

年間の削減効果、業種別に計算してみました👇
${LP}

#Pivolink #QRコード #コスト削減 #印刷費`,
  },
  {
    post_number: 12,
    category: 'pain_point',
    hashtags: ['Pivolink', 'QRコード', 'リンク切れ'],
    content: `キャンペーン終了後のQRコード、放置してませんか？

お客様がスキャンしたら404エラー…

それ、ブランドイメージを損なってます。

Pivolinkなら終了後もリンク先を変更可能。次のキャンペーンページや通常サイトに転送。

${BASE}

#Pivolink #QRコード #リンク切れ #ブランド`,
  },
  {
    post_number: 13,
    category: 'pain_point',
    hashtags: ['Pivolink', 'NFCタグ', 'NFC'],
    content: `店頭のNFCタグ、お客さんがタッチしたら404。

❌ キャンペーン終了後のリンク切れ
❌ サイトリニューアル後のURL変更
❌ 担当者が退職して誰も管理してない

全部Pivolinkで解決できます。

${BASE}

#Pivolink #NFCタグ #NFC #リンク切れ #店舗DX`,
  },
  {
    post_number: 14,
    category: 'pain_point',
    hashtags: ['Pivolink', 'QRコード', '飲食店'],
    content: `飲食店あるある：

「メニュー変わったからQRシール全席貼り替え…」

100席あったら100枚。それを季節ごとに。

Pivolinkなら管理画面で1クリック。全席のQRが新メニューに切り替わります。

詳しくはこちら👇
${LP_REST}

#Pivolink #QRコード #飲食店 #飲食店DX #メニュー`,
  },
  {
    post_number: 15,
    category: 'pain_point',
    hashtags: ['Pivolink', 'QRコード', '不動産'],
    content: `不動産あるある：

成約済み物件のチラシが街中に残ってる。

お客様がQRスキャン → 「この物件は掲載終了しました」

Pivolinkなら、成約後にリンク先を類似物件ページに自動切替。チラシが無駄にならない。

${LP_RE}

#Pivolink #QRコード #不動産 #不動産DX #物件`,
  },
  {
    post_number: 16,
    category: 'pain_point',
    hashtags: ['Pivolink', 'QRコード', 'EC'],
    content: `ECあるある：

商品パッケージのQR → サイトリニューアル → リンク切れ

出荷済みの商品は回収できない。

Pivolinkなら、パッケージのQRはそのまま、飛び先だけ新サイトに変更。

年間約53万円の損失を防げます👇
${LP_EC}

#Pivolink #QRコード #EC #ECサイト #通販`,
  },
  {
    post_number: 17,
    category: 'pain_point',
    hashtags: ['Pivolink', 'QRコード', 'イベント'],
    content: `イベントあるある：

告知チラシのQR → 当日は？ → 終了後は？

全部同じURL、全部同じページ…もったいない。

Pivolinkなら：
📢 開催前 → 告知ページ
📋 当日 → タイムテーブル
📸 終了後 → アーカイブ

自動切替で1枚のQRが3倍働く。
${LP_EVT}

#Pivolink #QRコード #イベント #展示会`,
  },
  {
    post_number: 18,
    category: 'pain_point',
    hashtags: ['Pivolink', 'NFCタグ', 'NFC', '名刺'],
    content: `NFC名刺、作ったけど転職したら？

普通のNFC名刺 → 書き換えるか捨てるしかない

Pivolink × NFC名刺：
✅ 転職しても名刺はそのまま
✅ リンク先だけ新しいプロフィールに変更
✅ 名刺のタッチ数も計測

${BASE}

#Pivolink #NFCタグ #NFC #名刺 #NFC名刺`,
  },
  {
    post_number: 19,
    category: 'pain_point',
    hashtags: ['Pivolink', 'QRコード', '効果測定'],
    content: `チラシにQRコード載せてるけど、効果わかってますか？

「何枚配って」「何回スキャンされたか」

これが分からないと、次の施策が打てない。

Pivolinkなら全スキャンを自動計測。日別・地域別・デバイス別で分析。

${BASE}

#Pivolink #QRコード #効果測定 #マーケティング #データ分析`,
  },
  {
    post_number: 20,
    category: 'pain_point',
    hashtags: ['Pivolink', 'QRコード', '看板'],
    content: `看板のQRコード、最後に更新したのいつですか？

看板は高い。QR付きならなおさら。

でもリンク先が古いまま放置されてるケース、実は多い。

Pivolinkなら看板を作り直さず、リンク先だけ最新に。

${BASE}

#Pivolink #QRコード #看板 #店舗 #コスト削減`,
  },

  // ===== C: 業種別ユースケース（日本語 #21-35） =====
  {
    post_number: 21,
    category: 'use_case',
    hashtags: ['Pivolink', 'QRコード', '飲食店', 'NFCタグ'],
    content: `【飲食店のPivolink活用】

🍽️ テーブルQR → 季節メニューを自動切替
⭐ レビュー誘導のA/Bテスト
📊 どの席からのスキャンが多いか分析
🏪 多店舗のQRを一括管理

年間約5.5万円のコスト削減＋作業時間8時間節約。

詳しくは👇
${LP_REST}

#Pivolink #QRコード #飲食店 #NFCタグ #飲食店DX`,
  },
  {
    post_number: 22,
    category: 'use_case',
    hashtags: ['Pivolink', 'QRコード', '不動産'],
    content: `【不動産のPivolink活用】

🏠 成約済み → 類似物件ページに自動切替
🪧 看板QR → 物件変更時にURL更新
📈 エリア別のスキャン効果を測定
🔄 チラシを再利用（印刷コスト削減）

年間約38.5万円のコスト削減。

詳しくは👇
${LP_RE}

#Pivolink #QRコード #不動産 #不動産DX #物件情報`,
  },
  {
    post_number: 23,
    category: 'use_case',
    hashtags: ['Pivolink', 'QRコード', 'EC', '通販'],
    content: `【EC・通販のPivolink活用】

📦 同梱QRでA/Bテスト（レビュー vs クーポン）
🔗 パッケージQR → サイト移行に追従
📊 どの商品のQRが一番スキャンされるか
💰 年間約53万円のコスト削減

詳しくは👇
${LP_EC}

#Pivolink #QRコード #EC #ECサイト #通販 #Eコマース`,
  },
  {
    post_number: 24,
    category: 'use_case',
    hashtags: ['Pivolink', 'QRコード', 'イベント', '展示会'],
    content: `【イベント・展示会のPivolink活用】

🎪 開催前→当日→終了後を自動切替
🎫 ポスターQRを次回イベントで再利用
📊 来場者のスキャン傾向を分析
📱 NFC wristbandで来場者体験向上

年間約26万円のコスト削減。

詳しくは👇
${LP_EVT}

#Pivolink #QRコード #イベント #展示会 #イベントDX`,
  },
  {
    post_number: 25,
    category: 'use_case',
    hashtags: ['Pivolink', 'QRコード', 'ホテル', '旅館'],
    content: `【ホテル・旅館のPivolink活用】

🛏️ 客室QR → 季節の観光案内に切替
🍳 朝食メニュー / ディナーメニューを時間で自動切替
📶 NFCタグでWi-Fi接続案内
🌐 外国人ゲスト → 英語ページに自動振分

${BASE}

#Pivolink #QRコード #ホテル #旅館 #インバウンド #観光DX`,
  },
  {
    post_number: 26,
    category: 'use_case',
    hashtags: ['Pivolink', 'QRコード', '美容院', 'サロン'],
    content: `【美容院・サロンのPivolink活用】

💇 カウンターNFC → 予約ページ直結
🎁 名刺QR → 月替わりクーポンページ
⭐ 施術後にレビュー誘導QR
📊 どの導線が予約に繋がってるか分析

${BASE}

#Pivolink #QRコード #美容院 #サロン #美容室 #NFCタグ`,
  },
  {
    post_number: 27,
    category: 'use_case',
    hashtags: ['Pivolink', 'QRコード', '製造業', '工場'],
    content: `【製造業のPivolink活用】

🏭 製品QR → マニュアルページ（バージョン更新に対応）
🔧 設備NFCタグ → 点検記録フォーム
📋 安全教育資料のQR → 最新版に自動更新
📊 どの資料がよく参照されてるか分析

${BASE}

#Pivolink #QRコード #製造業 #工場 #NFCタグ #DX`,
  },
  {
    post_number: 28,
    category: 'use_case',
    hashtags: ['Pivolink', 'QRコード', 'クリニック', '病院'],
    content: `【クリニック・病院のPivolink活用】

🏥 受付QR → 問診票フォーム
💊 薬袋QR → 服薬説明ページ
📅 予約システムへの導線
🌐 外国人患者 → 英語説明に自動切替

${BASE}

#Pivolink #QRコード #クリニック #病院 #医療DX`,
  },
  {
    post_number: 29,
    category: 'use_case',
    hashtags: ['Pivolink', 'QRコード', '教育', '学校'],
    content: `【教育機関のPivolink活用】

🎓 オープンキャンパスQR → 開催前/当日/事後で自動切替
📚 教材QR → 補足資料を随時更新
👨‍👩‍👧 保護者向け配布物QR → 最新のお知らせに
📊 どの配布物のQRがよく読まれてるか分析

${BASE}

#Pivolink #QRコード #教育 #学校 #教育DX`,
  },
  {
    post_number: 30,
    category: 'use_case',
    hashtags: ['Pivolink', 'QRコード', '自治体', '行政'],
    content: `【自治体・行政のPivolink活用】

🏛️ 広報誌QR → 最新の行政情報に自動更新
🗑️ ゴミ分別QR → 地区別ルール変更に対応
🚌 バス停NFC → リアルタイム時刻表
🌐 多言語対応で在留外国人にも

${BASE}

#Pivolink #QRコード #自治体 #行政DX #NFCタグ`,
  },

  // ===== D: 機能Tips（日本語 #31-40） =====
  {
    post_number: 31,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'QRコード', 'Tips'],
    content: `💡 Pivolink Tips：有効期限設定

QRコードに有効期限を設定できます。

期限切れ → 自動で別ページにリダイレクト

キャンペーン終了後の対応を自動化。人手ゼロ。

${BASE}

#Pivolink #QRコード #Tips #自動化`,
  },
  {
    post_number: 32,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'QRコード', 'Tips', '変更履歴'],
    content: `💡 Pivolink Tips：変更履歴

「前のURL何だっけ？」

Pivolinkは全変更を自動記録。

✅ いつ変更したか
✅ 誰が変更したか
✅ 変更前のURL

いつでもロールバック可能。安心して運用できます。

${BASE}

#Pivolink #QRコード #Tips #変更履歴`,
  },
  {
    post_number: 33,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'NFCタグ', 'NFC', 'Tips'],
    content: `💡 NFCタグの選び方

Pivolinkで使うなら：
📏 NTAG213（144バイト）で十分
💰 1枚30円〜100円
🔒 書き込みロック機能で誤上書き防止
📱 iPhone 7以降 / Android 5以降対応

タグは安い。Pivolinkと組み合わせれば、永久に使えるツールに。

${BASE}

#Pivolink #NFCタグ #NFC #NTAG213 #スマートタグ`,
  },

  // ===== E: 豆知識（日本語 #34-40） =====
  {
    post_number: 34,
    category: 'knowledge',
    hashtags: ['QRコード', 'NFCタグ', '豆知識'],
    content: `【豆知識】QRコード vs NFCタグ

QRコード：
📸 カメラで読み取り
📏 距離OK（ポスター・チラシ向き）
💰 印刷コストのみ

NFCタグ：
📱 かざすだけ（カメラ不要）
📏 近距離（テーブル・カウンター向き）
💰 1枚30円〜

どちらもPivolinkで管理できます👇
${BASE}

#QRコード #NFCタグ #NFC #豆知識`,
  },
  {
    post_number: 35,
    category: 'knowledge',
    hashtags: ['QRコード', '豆知識', 'デザイン'],
    content: `【豆知識】QRコードにロゴを入れても読めるの？

答え：読めます。

QRコードにはエラー訂正機能があり、面積の最大30%まで隠しても読み取り可能。

ブランドロゴ入りQRコードで、デザイン性と機能性を両立しましょう。

#QRコード #豆知識 #デザイン #ブランディング`,
  },

  // ===== F: 英語投稿（#36-60） =====
  {
    post_number: 36,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'NFCtag'],
    content: `Printed a QR code, but the URL changed?

Don't reprint. Just redirect.

Pivolink lets you change where your QR codes & NFC tags point — anytime, from a simple dashboard.

Free plan available.
${BASE}

#Pivolink #QRCode #NFCtag #DX #MarTech`,
  },
  {
    post_number: 37,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Marketing'],
    content: `"QR codes are permanent once printed."

Not anymore.

With Pivolink, one QR code can point to different URLs over time. Change campaigns, menus, and promotions — without reprinting.

${BASE}

#Pivolink #QRCode #Marketing #PrintMedia`,
  },
  {
    post_number: 38,
    category: 'english',
    hashtags: ['Pivolink', 'NFCtag', 'NFC'],
    content: `NFC tags: set it and forget it?

Not with Pivolink.

✅ Change the destination anytime
✅ Track tap analytics
✅ Route by device (iOS/Android)

One NFC tag. Infinite possibilities.

${BASE}

#Pivolink #NFCtag #NFC #SmartTag #IoT`,
  },
  {
    post_number: 39,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Restaurant'],
    content: `Restaurant owners: still replacing QR stickers every season?

With Pivolink:
🍽️ Auto-switch menus by time of day
⭐ A/B test review pages
📊 Track which tables scan most

Save $500+/year on printing alone.

${LP_REST}

#Pivolink #QRCode #Restaurant #FoodTech`,
  },
  {
    post_number: 40,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'RealEstate'],
    content: `Real estate agents: your sold property flyers are still out there.

Customers scan the QR → 404 error.

With Pivolink, redirect sold listings to similar properties automatically.

Save $3,000+/year on flyer reprints.

${LP_RE}

#Pivolink #QRCode #RealEstate #PropTech`,
  },
  {
    post_number: 41,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Ecommerce'],
    content: `E-commerce brands: what happens when you redesign your website?

Every QR code on every shipped package → broken link.

Pivolink keeps your package QR codes alive. Update the destination, not the packaging.

${LP_EC}

#Pivolink #QRCode #Ecommerce #DTC #PackagingDesign`,
  },
  {
    post_number: 42,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Events'],
    content: `Event organizers: one QR code, three phases.

📢 Before: event info & registration
📋 During: live schedule & maps
📸 After: photos & recordings

Pivolink auto-switches by date. No manual updates.

${LP_EVT}

#Pivolink #QRCode #Events #EventTech #Conferences`,
  },
  {
    post_number: 43,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'ABtest'],
    content: `Did you know? You can A/B test with a single QR code.

Pivolink splits traffic between multiple URLs automatically.

Test landing pages, offers, and CTAs — all from one printed QR.

${BASE}

#Pivolink #QRCode #ABtest #CRO #GrowthHacking`,
  },
  {
    post_number: 44,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Analytics'],
    content: `How many times was your QR code scanned?

Most businesses have no idea.

Pivolink tracks:
📊 Daily/hourly scans
📱 Device & browser breakdown
🌍 Geographic data

Turn printed media into measurable marketing.

${BASE}

#Pivolink #QRCode #Analytics #DataDriven #MarTech`,
  },
  {
    post_number: 45,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'NFC', 'Free'],
    content: `Pivolink pricing:

🆓 Free: up to 5 links
💼 Pro: $7/mo (unlimited links)
🏢 Business: $35/mo (team + API)

Start free. Scale when you're ready.

${BASE}

#Pivolink #QRCode #NFC #SaaS #Free #Startup`,
  },
  {
    post_number: 46,
    category: 'english',
    hashtags: ['Pivolink', 'NFCTag', 'BusinessCard'],
    content: `NFC business cards + Pivolink = future-proof networking.

Change jobs? Update the destination.
New portfolio? Switch the link.

Your card stays the same. The destination evolves with you.

${BASE}

#Pivolink #NFCTag #BusinessCard #Networking #NFC`,
  },
  {
    post_number: 47,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Hotel'],
    content: `Hotels: one QR code in every room.

🛏️ Spring → cherry blossom tour guide
☀️ Summer → beach activities
🍁 Fall → harvest festival info
❄️ Winter → ski resort packages

Auto-switch by season. Never reprint.

${BASE}

#Pivolink #QRCode #Hotel #Hospitality #Tourism`,
  },
  {
    post_number: 48,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'DeviceRouting'],
    content: `Same QR code. Different destinations by device.

📱 iPhone → App Store
🤖 Android → Google Play
💻 Desktop → Website

Smart device routing with Pivolink.

${BASE}

#Pivolink #QRCode #DeviceRouting #AppMarketing #DeepLink`,
  },
  {
    post_number: 49,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Sustainability'],
    content: `Sustainability tip: Stop reprinting.

Every QR code change = new flyers, stickers, packaging.

With Pivolink, update the destination digitally. Keep the physical materials.

Less waste. Less cost. Better marketing.

${BASE}

#Pivolink #QRCode #Sustainability #GreenBusiness #ESG`,
  },
  {
    post_number: 50,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Healthcare'],
    content: `Healthcare: QR codes that stay current.

🏥 Waiting room QR → patient intake form
💊 Prescription label → medication guide
📅 Appointment scheduling link
🌐 Auto-translate for international patients

${BASE}

#Pivolink #QRCode #Healthcare #HealthTech #MedTech`,
  },
  {
    post_number: 51,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Education'],
    content: `Schools & universities: dynamic QR codes for education.

🎓 Open day QR → pre-event / day-of / post-event
📚 Textbook QR → always-updated supplementary materials
👨‍👩‍👧 Parent handouts → latest announcements

${BASE}

#Pivolink #QRCode #Education #EdTech #University`,
  },
  {
    post_number: 52,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Manufacturing'],
    content: `Manufacturing: QR codes on products that never go stale.

🏭 Product QR → latest manual version
🔧 Equipment NFC → maintenance log
📋 Safety docs → always up-to-date

${BASE}

#Pivolink #QRCode #Manufacturing #Industry40 #NFC`,
  },
  {
    post_number: 53,
    category: 'english',
    hashtags: ['Pivolink', 'NFCTag', 'RetailTech'],
    content: `Retail stores: NFC tags that work harder.

👕 Product NFC → styling suggestions
💳 Counter NFC → loyalty program signup
🎁 Seasonal promotions → auto-switch by date

One tag. Always relevant.

${BASE}

#Pivolink #NFCTag #RetailTech #Retail #SmartStore`,
  },
  {
    post_number: 54,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Signage'],
    content: `That QR code on your signage — when was it last updated?

Signs are expensive. QR-enabled signs, even more so.

Don't rebuild the sign. Just update the link.

Pivolink: change the destination, keep the sign.

${BASE}

#Pivolink #QRCode #Signage #OOH #DigitalSignage`,
  },
  {
    post_number: 55,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'Startup'],
    content: `Building a startup? Here's a growth hack:

Put QR codes everywhere — business cards, stickers, packaging.

When your landing page changes (it will), just update Pivolink. No reprints.

Your early marketing materials never expire.

${BASE}

#Pivolink #QRCode #Startup #GrowthHack #Marketing`,
  },

  // ===== G: エンゲージメント・CTA（日本語 #56-60） =====
  {
    post_number: 56,
    category: 'engagement',
    hashtags: ['Pivolink', 'QRコード', 'NFCタグ'],
    content: `QRコード活用してる方に質問です🙋

どんなシーンで使ってますか？

1️⃣ チラシ・パンフレット
2️⃣ 名刺
3️⃣ 商品パッケージ
4️⃣ 店頭POP・看板
5️⃣ その他（リプで教えてください！）

#Pivolink #QRコード #NFCタグ #アンケート`,
  },
  {
    post_number: 57,
    category: 'engagement',
    hashtags: ['Pivolink', 'QRコード'],
    content: `Pivolink、β版公開中です🎉

現在の機能：
✅ QRリダイレクト管理
✅ NFC対応
✅ スケジュール切替
✅ A/Bテスト
✅ アクセス解析

無料プランで試せます。フィードバック大歓迎！

${BASE}

#Pivolink #QRコード #βテスト #フィードバック募集`,
  },
  {
    post_number: 58,
    category: 'campaign',
    hashtags: ['Pivolink', 'QRコード', 'NFCタグ'],
    content: `📢 Pivolink 無料プラン、5リンクまで使い放題。

「ちょっと試したい」にぴったり。

✅ QRコード自動生成
✅ リダイレクト変更し放題
✅ アクセス解析付き

クレジットカード不要。30秒で始められます👇
${BASE}/login

#Pivolink #QRコード #NFCタグ #無料 #SaaS`,
  },
  {
    post_number: 59,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode'],
    content: `🗓️ Pivolink weekly tip:

Schedule your QR code redirects in advance.

Monday → Sale page
Weekend → Regular page

Set it once. Pivolink handles the rest.

${BASE}

#Pivolink #QRCode #WeeklyTip #MarketingTips`,
  },
  {
    post_number: 60,
    category: 'english',
    hashtags: ['Pivolink', 'QRCode', 'NFC'],
    content: `🚀 Pivolink is in beta — and it's free to try.

✅ Dynamic QR code management
✅ NFC tag read/write
✅ Schedule-based redirects
✅ A/B testing
✅ Access analytics

No credit card required.
${BASE}

#Pivolink #QRCode #NFC #Beta #SaaS #Startup`,
  },
]
