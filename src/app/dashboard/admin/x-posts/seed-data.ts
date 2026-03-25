interface SeedPost {
  content: string
  category: string
  post_number: number
  hashtags: string[]
}

export const SEED_POSTS: SeedPost[] = [
  // ===== カテゴリA: サービス紹介・基本価値（#1-15） =====
  {
    post_number: 1,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード'],
    content: `印刷したQRコード、URLが変わったらどうしますか？

答え：刷り直さなくていい。

Pivolink（ピボリンク）は、印刷済みQRコード・設置済みNFCタグのリンク先を管理画面からいつでも変更できるサービスです。

無料プランあり。今すぐ始められます。
https://redirect.tsuratsura.com

#Pivolink #QRコード`,
  },
  {
    post_number: 2,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', 'DX'],
    content: `「QRコードは印刷したら変えられない」

その常識、もう古いです。

Pivolinkなら、印刷後でもリンク先を自由に変更。
再印刷ゼロ。コスト削減。即時反映。

https://redirect.tsuratsura.com
#Pivolink #QRコード #DX`,
  },
  {
    post_number: 3,
    category: 'service_intro',
    hashtags: ['Pivolink', '販促'],
    content: `Pivolinkの仕組みはシンプルです。

① Pivolinkでリンクを発行
② そのURLでQRコードを印刷
③ キャンペーンが変わったら、管理画面でリンク先を変更

QRコード自体はそのまま。リンク先だけが変わる。
再印刷も再設置も不要です。

#Pivolink #販促`,
  },
  {
    post_number: 4,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード'],
    content: `名刺に印刷したQRコード、
チラシに載せたQRコード、
パッケージに印刷したQRコード。

全部、リンク先を後から変えられます。

それがPivolinkです。
https://redirect.tsuratsura.com

#Pivolink #QRコード`,
  },
  {
    post_number: 5,
    category: 'service_intro',
    hashtags: ['Pivolink', 'マーケティング'],
    content: `QRコードを「使い捨て」にしていませんか？

Pivolinkを使えば、一度印刷したQRコードが
ずっと使える「資産」に変わります。

キャンペーンが変わっても、サイトを移行しても、
管理画面からワンクリックで切り替え。

#Pivolink #マーケティング`,
  },
  {
    post_number: 6,
    category: 'service_intro',
    hashtags: ['Pivolink', 'SaaS'],
    content: `Pivolinkでできること：

・リンク先の即時変更
・スケジュール切替（自動で日時指定変更）
・デバイス別振分（iOS/Android/PC）
・A/Bテスト
・クッションページ表示
・アクセス解析
・変更履歴の完全ログ

無料で3リンクまで使えます。

#Pivolink #SaaS`,
  },
  {
    post_number: 7,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', 'DX'],
    content: `「え、QRコードのリンク先って後から変えられるの？」

はい、変えられます。

Pivolinkは印刷済みのQRコード・設置済みのNFCタグのリダイレクト先を、管理画面から何度でも変更できるサービスです。

#Pivolink #QRコード #DX`,
  },
  {
    post_number: 8,
    category: 'service_intro',
    hashtags: ['Pivolink'],
    content: `QRコードの"もったいない"を解決するサービスを作りました。

・キャンペーン終了後のQR → リンク切れ
・サイトリニューアル後のQR → 404エラー
・売切れ商品のNFC → 存在しないページ

Pivolinkなら、全部管理画面から修正できます。

#Pivolink`,
  },
  {
    post_number: 9,
    category: 'service_intro',
    hashtags: ['Pivolink', 'インバウンド', '観光DX'],
    content: `Pivolinkは日本語・英語・中国語に対応。

インバウンド向けの観光案内、多言語ECサイトへの誘導にもそのまま使えます。

https://redirect.tsuratsura.com

#Pivolink #インバウンド #観光DX`,
  },
  {
    post_number: 10,
    category: 'service_intro',
    hashtags: ['Pivolink', 'SaaS'],
    content: `Pivolinkの料金：

Free：¥0（3リンク / 月1,000アクセス）
Pro：¥780（50リンク / 月50,000アクセス）
Business：¥3,980（無制限）

※ベータ特別価格。Freeプランはカード登録不要。

#Pivolink #SaaS`,
  },
  {
    post_number: 11,
    category: 'service_intro',
    hashtags: ['Pivolink', 'NFC', 'NFCタグ'],
    content: `NFCタグの書き換え作業、もうやめませんか？

PivolinkのURLをNFCに1回書き込めば、
あとは管理画面からリンク先を変えるだけ。

物理的な作業ゼロで、遷移先を何度でも更新。

#Pivolink #NFC #NFCタグ`,
  },
  {
    post_number: 12,
    category: 'service_intro',
    hashtags: ['Pivolink'],
    content: `Pivolink = Pivot + Link

「ピボット」のように、リンク先を軽やかに切り替える。

印刷したQRコードのURLを、あとから自由に。
https://redirect.tsuratsura.com

#Pivolink`,
  },
  {
    post_number: 13,
    category: 'service_intro',
    hashtags: ['Pivolink', 'QRコード', '販促'],
    content: `QRコードにまつわる3大ストレス：

1. URLが変わったら刷り直し
2. キャンペーン終了後にリンク切れ
3. 効果測定ができない

Pivolinkは3つとも解決します。

#Pivolink #QRコード #販促`,
  },
  {
    post_number: 14,
    category: 'service_intro',
    hashtags: ['Pivolink'],
    content: `「Pivolinkってつまり何？」

→ QRコード・NFCタグの"リモコン"です。

物理的に印刷・設置したものはそのまま。
リンク先だけを、いつでもどこからでも操作できます。

#Pivolink`,
  },
  {
    post_number: 15,
    category: 'service_intro',
    hashtags: ['Pivolink'],
    content: `Pivolink、始め方は3ステップ：

1. 無料アカウント作成（メールだけでOK）
2. リンクを発行してQRコードをダウンロード
3. チラシやパッケージに印刷

あとはリンク先を変えたいときに管理画面を開くだけ。

https://redirect.tsuratsura.com
#Pivolink`,
  },

  // ===== カテゴリB: 課題提起・共感系（#16-30） =====
  {
    post_number: 16,
    category: 'pain_point',
    hashtags: ['Pivolink', '印刷コスト削減'],
    content: `キャンペーンが変わるたびにQRコード入りのチラシを全部刷り直してる会社、まだありますか？

...たぶんあると思います。

その費用と手間、Pivolinkで0円にできます。

#Pivolink #印刷コスト削減`,
  },
  {
    post_number: 17,
    category: 'pain_point',
    hashtags: ['Pivolink', 'QRコード'],
    content: `あるある：
名刺のQRコード → 旧サイトに飛ぶ
商品同梱のQR → 終了したキャンペーンページ
店頭POP → 404エラー

全部「印刷した後に変えられない」のが原因です。

#Pivolink #QRコード`,
  },
  {
    post_number: 18,
    category: 'pain_point',
    hashtags: ['Pivolink', '業務効率化'],
    content: `「QRコードのリンク先が変わったんですけど...」
「じゃあチラシ5000枚刷り直しですね」

この会話、もうなくしませんか？

#Pivolink #業務効率化`,
  },
  {
    post_number: 19,
    category: 'pain_point',
    hashtags: ['Pivolink', 'NFC', 'DX'],
    content: `NFCタグを100個設置した施設で、URLを変更することに。

選択肢A：100個全部書き換え（半日作業）
選択肢B：Pivolinkで管理画面からワンクリック（3秒）

どちらを選びますか？

#Pivolink #NFC #DX`,
  },
  {
    post_number: 20,
    category: 'pain_point',
    hashtags: ['Pivolink', '販促'],
    content: `【実はめちゃくちゃもったいない話】

印刷済みチラシのQRコード。
キャンペーン終了後、そのチラシはまだ世の中にあります。

でもリンク先は死んでる。

Pivolinkなら次のキャンペーンに差し替えるだけ。

#Pivolink #販促`,
  },
  {
    post_number: 21,
    category: 'pain_point',
    hashtags: ['Pivolink', 'EC'],
    content: `EC事業者あるある：

商品ページのURL変更
→ パッケージのQRコードが全部リンク切れ
→ 在庫のパッケージ全部シール貼り替え
→ コストと時間が飛んでいく

#Pivolink なら管理画面で即解決。`,
  },
  {
    post_number: 22,
    category: 'pain_point',
    hashtags: ['Pivolink', 'DX'],
    content: `「サイトリニューアルしたいけど、名刺のQRコードが...」

そう言ってリニューアルを先延ばしにしてませんか？

Pivolinkを使えば、名刺はそのまま。URLだけ切り替えられます。

#Pivolink #DX`,
  },
  {
    post_number: 23,
    category: 'pain_point',
    hashtags: ['Pivolink', 'NFC'],
    content: `店頭のNFCタグ、お客さんがタッチしたら404。

これ、お客さんは「この店ちゃんとしてないな」と思います。

たった1つのリンク切れが、ブランドイメージを傷つける。
管理できる仕組み、持ってますか？

#Pivolink #NFC`,
  },
  {
    post_number: 24,
    category: 'pain_point',
    hashtags: ['Pivolink', 'コスト削減'],
    content: `QRコードの印刷代、年間いくらかかってますか？

仮にチラシ5000枚 × 年4回キャンペーン = 2万枚

Pivolinkなら1回の印刷で済みます。
年間の印刷コスト、最大75%カットも可能。

#Pivolink #コスト削減`,
  },
  {
    post_number: 25,
    category: 'pain_point',
    hashtags: ['Pivolink', '飲食店経営'],
    content: `季節ごとにメニューが変わる飲食店さん。
テーブルのQRコードを毎回貼り替えてませんか？

春メニュー → 夏メニュー → 秋メニュー → 冬メニュー

Pivolinkならスケジュール設定で自動切替。
一度貼れば、あとは放っておくだけ。

#Pivolink #飲食店経営`,
  },
  {
    post_number: 26,
    category: 'pain_point',
    hashtags: ['Pivolink', '製造業'],
    content: `「リコール発生！パッケージのQRコードを告知ページに切り替えて！」

普通：パッケージ回収 → 刷り直し → 数週間
Pivolink：管理画面でURL変更 → 即時反映

緊急時の初動スピードが変わります。

#Pivolink #製造業`,
  },
  {
    post_number: 27,
    category: 'pain_point',
    hashtags: ['Pivolink', '不動産'],
    content: `不動産あるある：

成約済み物件のチラシが街中に残ってる
→ QR読み取り → 「この物件は掲載終了しました」

もったいなくないですか？
次の物件情報に差し替えれば、チラシが再び働きます。

#Pivolink #不動産`,
  },
  {
    post_number: 28,
    category: 'pain_point',
    hashtags: ['Pivolink', 'マーケティング'],
    content: `マーケ担当の本音：

「どのQRコードが何回スキャンされたか分からない」
「チラシとWebの効果を紐づけられない」
「でもGAだけじゃQR経由って分からない」

Pivolinkのアクセス解析なら、全部見えます。

#Pivolink #マーケティング`,
  },
  {
    post_number: 29,
    category: 'pain_point',
    hashtags: ['Pivolink', 'BtoB', '展示会'],
    content: `展示会のパンフレットに載せたQRコード。

展示会が終わっても、そのパンフは相手のデスクにある。
半年後に読み取ったら...リンク切れ。

展示会後こそ営業チャンス。
Pivolinkでリンクを生かし続けましょう。

#Pivolink #BtoB #展示会`,
  },
  {
    post_number: 30,
    category: 'pain_point',
    hashtags: ['Pivolink'],
    content: `「QRコードなんてどこも一緒でしょ？」

いいえ、違います。

ほとんどのQR生成ツールは「作って終わり」。
Pivolinkは「作ってから始まる」。

リンク先変更、スケジュール切替、A/Bテスト、解析。
QRコードが"運用できる資産"に変わります。

#Pivolink`,
  },

  // ===== カテゴリC: 業種別ユースケース（#31-50） =====
  {
    post_number: 31,
    category: 'use_case',
    hashtags: ['Pivolink', '飲食店経営', 'QRコード'],
    content: `飲食店のPivolink活用例：

・テーブルQR → 季節メニューに自動切替
・レジ横NFC → 今月のクーポンページ
・テイクアウト袋QR → レビュー依頼 or 次回割引

1回の設置で、ずっと使い回せます。

#Pivolink #飲食店経営 #QRコード`,
  },
  {
    post_number: 32,
    category: 'use_case',
    hashtags: ['Pivolink', 'ホテル', '観光DX'],
    content: `ホテル・旅館のPivolink活用例：

・客室NFC → 季節の観光案内（春:花見/夏:海/秋:紅葉/冬:温泉）
・ロビーQR → 今月のイベント情報
・チェックイン案内 → 多言語ページ自動振分

NFCの貼り替え作業、ゼロにできます。

#Pivolink #ホテル #観光DX`,
  },
  {
    post_number: 33,
    category: 'use_case',
    hashtags: ['Pivolink', '不動産'],
    content: `不動産会社のPivolink活用例：

・物件チラシQR → 成約後は次の物件に差し替え
・看板QR → 完売後は新規分譲地に切替
・名刺QR → 担当物件一覧（常に最新に更新）

チラシの刷り直し、0回に。

#Pivolink #不動産`,
  },
  {
    post_number: 34,
    category: 'use_case',
    hashtags: ['Pivolink', 'EC'],
    content: `EC・通販のPivolink活用例：

・商品同梱QR → レビュー誘導 / クーポン配布をA/Bテスト
・パッケージQR → 商品ページ移行時も自動追従
・ダンボール印刷QR → キャンペーンに合わせて都度変更

同梱物のQR、使い捨てにしてませんか？

#Pivolink #EC`,
  },
  {
    post_number: 35,
    category: 'use_case',
    hashtags: ['Pivolink', '製造業', 'QRコード'],
    content: `製造業のPivolink活用例：

・製品パッケージQR → 取扱説明書（PDF更新時も追従）
・リコール時 → 緊急告知ページに即切替
・製品ラベルNFC → ロット別の品質情報ページ

パッケージの刷り直し不要。管理画面で即対応。

#Pivolink #製造業 #QRコード`,
  },
  {
    post_number: 36,
    category: 'use_case',
    hashtags: ['Pivolink', '美容室', 'サロン経営'],
    content: `美容院・サロンのPivolink活用例：

・ショップカードQR → 予約ページ（システム変更時も追従）
・店頭POP → 今月のキャンペーン
・レシートQR → 次回割引クーポン → 翌月は別のクーポンに自動切替

常に最新の情報にリンクし続けます。

#Pivolink #美容室 #サロン経営`,
  },
  {
    post_number: 37,
    category: 'use_case',
    hashtags: ['Pivolink', 'イベント'],
    content: `イベント主催者のPivolink活用例：

・ポスターQR → イベント詳細ページ
・入場チケットQR → 当日タイムテーブル → 終了後はアーカイブ動画へ
・スポンサーブースNFC → 企業ページ（開催後は成果レポートに切替）

1回のイベントで終わらせない。

#Pivolink #イベント`,
  },
  {
    post_number: 38,
    category: 'use_case',
    hashtags: ['Pivolink', '観光DX', 'インバウンド'],
    content: `観光・自治体のPivolink活用例：

・観光看板QR → 季節別おすすめスポット
・パンフQR → デバイス別言語振分（iOS→英語/Android→中国語）
・スタンプラリーNFC → 今年のルートに毎年更新

多言語対応 × スケジュール切替で観光DX。

#Pivolink #観光DX #インバウンド`,
  },
  {
    post_number: 39,
    category: 'use_case',
    hashtags: ['Pivolink', '教育DX'],
    content: `学校・教育機関のPivolink活用例：

・学校案内パンフQR → 最新の学校情報に常時更新
・掲示板QR → 今月の行事予定
・学園祭ポスターQR → 当日マップ → 終了後はフォトギャラリーへ

年度が変わっても、QRはそのまま。

#Pivolink #教育DX`,
  },
  {
    post_number: 40,
    category: 'use_case',
    hashtags: ['Pivolink', 'クリニック'],
    content: `クリニックのPivolink活用例：

・診察券QR → Web予約ページ（システム変更にも追従）
・院内ポスターQR → 今月の健康情報
・待合室NFC → 問診票フォーム（季節に応じた内容に切替）

患者さんの「リンクが開かない」をゼロに。

#Pivolink #クリニック`,
  },
  {
    post_number: 41,
    category: 'use_case',
    hashtags: ['Pivolink', 'アパレル', 'ファッション'],
    content: `アパレルのPivolink活用例：

・商品タグQR → コーディネート提案ページ
・ショッパー（紙袋）QR → 今季コレクション → 来季はNewコレへ
・店頭POP NFC → セール情報 → 通常期はブランドストーリーへ

タグも袋も、次のシーズンでまた活きる。

#Pivolink #アパレル #ファッション`,
  },
  {
    post_number: 42,
    category: 'use_case',
    hashtags: ['Pivolink', '食品メーカー'],
    content: `食品メーカーのPivolink活用例：

・ペットボトルラベルQR → キャンペーン応募ページ
  → 終了後は商品情報ページへ自動切替
・パッケージQR → レシピ動画（季節ごとに更新）
・アレルギー表示更新 → 管理画面で即反映

#Pivolink #食品メーカー`,
  },
  {
    post_number: 43,
    category: 'use_case',
    hashtags: ['Pivolink', 'フィットネス', 'ジム'],
    content: `ジム・フィットネスのPivolink活用例：

・マシンのNFCタグ → 使い方動画（機種更新時もURL変更不要）
・入口QR → 今月のレッスンスケジュール
・会員カードQR → マイページ（システム移行にも追従）

#Pivolink #フィットネス #ジム`,
  },
  {
    post_number: 44,
    category: 'use_case',
    hashtags: ['Pivolink', '自動車'],
    content: `自動車ディーラーのPivolink活用例：

・展示車のQR → 詳細スペックページ（在庫入替で自動切替）
・チラシQR → 今月のフェア情報
・アフターサービスQR → 車検予約 / リコール情報

展示車が変わっても、QRは貼り替え不要。

#Pivolink #自動車`,
  },
  {
    post_number: 45,
    category: 'use_case',
    hashtags: ['Pivolink', '物流', 'DX'],
    content: `物流・倉庫のPivolink活用例：

・倉庫内NFCタグ → 作業手順書（改訂時もURL変更不要）
・配送伝票QR → 荷物追跡ページ
・コンテナNFC → 内容物リスト（積替え時に更新）

現場のNFC書き換え作業をゼロに。

#Pivolink #物流 #DX`,
  },
  {
    post_number: 46,
    category: 'use_case',
    hashtags: ['Pivolink', 'BtoB', '営業'],
    content: `法人営業のPivolink活用例：

・名刺QR → ポートフォリオ（実績が増えたら即更新）
・提案書QR → 詳細資料ページ（提出後もアップデート可能）
・展示会パンフQR → 展示会後は個別面談予約ページへ

名刺が「最新の営業ツール」で在り続けます。

#Pivolink #BtoB #営業`,
  },
  {
    post_number: 47,
    category: 'use_case',
    hashtags: ['Pivolink', '飲食チェーン'],
    content: `飲食チェーンのPivolink活用例：

本部が一括でリンク先を管理
→ 全店舗のQRコードを同時に更新

新メニューリリース → 全店のテーブルQRが一斉切替
キャンペーン開始 → 全店のPOPが一斉にLP誘導

店舗ごとの貼り替え作業ゼロ。

#Pivolink #飲食チェーン`,
  },
  {
    post_number: 48,
    category: 'use_case',
    hashtags: ['Pivolink', '出版', 'メディア'],
    content: `出版社のPivolink活用例：

・書籍内QR → 読者特典ページ（増刷時もQR変更不要）
・雑誌広告QR → 広告主のLPを掲載号ごとに切替
・新聞折込QR → 毎週のおすすめ記事ページ

紙媒体 × デジタルの連携が劇的にスムーズに。

#Pivolink #出版 #メディア`,
  },
  {
    post_number: 49,
    category: 'use_case',
    hashtags: ['Pivolink', 'ブライダル'],
    content: `ブライダル・冠婚葬祭のPivolink活用例：

・招待状QR → 会場案内 → 当日はライブ配信 → 後日はフォトアルバム
・式場パンフQR → 今月のフェア情報
・引出物QR → お礼メッセージ → 後日は新居報告ページへ

1つのQRで、イベントの前・中・後を繋ぐ。

#Pivolink #ブライダル`,
  },
  {
    post_number: 50,
    category: 'use_case',
    hashtags: ['Pivolink', '行政DX', '自治体'],
    content: `行政・公共施設のPivolink活用例：

・広報誌QR → 手続き案内（制度変更時にURL更新不要）
・公共施設NFC → 利用ガイド（改修時に自動更新）
・防災看板QR → 通常時は避難マップ → 災害時は緊急情報ページ

市民が「情報が古い」と困ることをなくす。

#Pivolink #行政DX #自治体`,
  },

  // ===== カテゴリD: 機能紹介・Tips（#51-65） =====
  {
    post_number: 51,
    category: 'feature_tips',
    hashtags: ['Pivolink', '販促'],
    content: `Pivolinkの「スケジュール切替」機能：

日時を指定して、リンク先を自動で切り替え。

例：
3/1 0:00 → 春キャンペーンLP
6/1 0:00 → 夏キャンペーンLP

設定しておけば、あとは何もしなくてOK。
手動切替の"忘れ"もゼロに。

#Pivolink #販促`,
  },
  {
    post_number: 52,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'QRコード'],
    content: `Pivolinkの「デバイス別振分」機能：

同じQRコードをスキャンしても：
・iPhoneユーザー → App Store
・Androidユーザー → Google Play
・PCユーザー → Webサイト

1つのQRコードで、全デバイスに最適な体験を。

#Pivolink #QRコード`,
  },
  {
    post_number: 53,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'マーケティング'],
    content: `PivolinkのA/Bテスト機能：

1つのQRコードで2つのURLにトラフィックを分割。

例：
URL-A（商品ページ）：70%
URL-B（LP）：30%

どちらがコンバージョン高いか、リアルデータで検証。
チラシの効果測定がついにできる。

#Pivolink #マーケティング`,
  },
  {
    post_number: 54,
    category: 'feature_tips',
    hashtags: ['Pivolink'],
    content: `Pivolinkの「クッションページ」機能：

QRを読み取った後、リダイレクト先に飛ぶ前にお知らせを表示。

活用例：
・「このQRは外部サイトに遷移します」の注意書き
・期間限定クーポンコードの表示
・アンケートへの協力依頼

#Pivolink`,
  },
  {
    post_number: 55,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'マーケティング'],
    content: `Pivolinkのアクセス解析：

・日別スキャン数の推移グラフ
・デバイス別（iOS / Android / PC）
・OS別 / ブラウザ別
・時間帯別アクセス

「このチラシ、何回スキャンされた？」が一目瞭然。
オフライン施策の効果測定に。

#Pivolink #マーケティング`,
  },
  {
    post_number: 56,
    category: 'feature_tips',
    hashtags: ['Pivolink', '業務効率化'],
    content: `Pivolinkの変更履歴機能：

いつ・誰が・どのURLに変更したかを完全ログ。

「あのリンク、誰がいつ変更した？」
→ 履歴を見れば一発で分かります。

チーム運用でのトラブル防止に。

#Pivolink #業務効率化`,
  },
  {
    post_number: 57,
    category: 'feature_tips',
    hashtags: ['Pivolink'],
    content: `Pivolinkの有効期限設定：

リンクに期限を設定 → 期限切れ後はフォールバックURLへ自動転送。

例：
キャンペーンQR → 3/31まで応募ページ → 4/1から通常サイトへ

「期限切れのリンクが404」を防ぎます。

#Pivolink`,
  },
  {
    post_number: 58,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'QRコード'],
    content: `PivolinkのQRコード生成：

リンクを作ると、QRコードが自動で生成されます。

・PNG形式（Web・印刷用）
・SVG形式（高解像度・拡大しても劣化なし）

ダウンロードしてそのまま入稿可能。
別のQR生成ツールは不要です。

#Pivolink #QRコード`,
  },
  {
    post_number: 59,
    category: 'feature_tips',
    hashtags: ['Pivolink'],
    content: `【Pivolink Tips】スラッグの命名、おすすめルール：

redirect.tsuratsura.com/r/ の後ろは自由に設定可能。

例：
/r/spring-2026 → 2026年春キャンペーン
/r/menu → メニューページ
/r/review → レビューページ

分かりやすいスラッグにすると管理が楽です。

#Pivolink`,
  },
  {
    post_number: 60,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'NFC'],
    content: `【Pivolink Tips】NFCタグ運用のコツ：

NFCタグにPivolinkのURLを1回書き込んだら、
以後の変更は全て管理画面から。

ポイント：
・タグに書くURL: redirect.tsuratsura.com/r/your-slug
・リンク先の変更: 管理画面でワンクリック
・タグの物理的な書き換え: 不要

#Pivolink #NFC`,
  },
  {
    post_number: 61,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'チラシ'],
    content: `【Tips】チラシにQRを載せるときの鉄則：

1. QRの近くに「読み取るとこうなる」を明記
2. スラッグは短く覚えやすく
3. QRコードの周囲に余白を確保（読み取り精度UP）
4. Pivolinkで発行 → 後からリンク先変更可能

4番目がミソです。

#Pivolink #チラシ`,
  },
  {
    post_number: 62,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'EC'],
    content: `【Tips】A/Bテストの賢い使い方：

「商品同梱QRでレビューを増やしたい」

URL-A: レビュー依頼ページ（50%）
URL-B: 次回10%OFFクーポン（50%）

→ 2週間後にデータ比較
→ 効果が高い方に100%切替

印刷コストゼロで施策検証。

#Pivolink #EC`,
  },
  {
    post_number: 63,
    category: 'feature_tips',
    hashtags: ['Pivolink'],
    content: `【Tips】緊急時こそPivolinkが活きる：

商品リコール → 告知ページに即切替
サーバー障害 → メンテナンスページに一時変更
イベント中止 → 返金案内ページに差替え

管理画面にログイン → URL変更 → 即時反映。

対応スピードが企業の信頼を守ります。

#Pivolink`,
  },
  {
    post_number: 64,
    category: 'feature_tips',
    hashtags: ['Pivolink'],
    content: `【Tips】クッションページの活用アイデア：

・「公式LINEを友だち追加すると特典あり！」→ LINEへ誘導
・「この先は外部サイトです」→ 安心感の提供
・「アンケートに答えてクーポンGET」→ 回答率UP

リダイレクト前の"1画面"で、もう1アクション。

#Pivolink`,
  },
  {
    post_number: 65,
    category: 'feature_tips',
    hashtags: ['Pivolink', 'マーケティング'],
    content: `【Tips】アクセス解析の見るべきポイント：

・スキャン数が急増した日 → 配布日の効果測定
・デバイス比率 → ターゲット層の確認
・時間帯 → 最もスキャンされる時間の把握

「チラシ配布日の翌日にスキャンが集中」
→ 即日ではなく持ち帰り後に読み取る傾向

#Pivolink #マーケティング`,
  },

  // ===== カテゴリE: 豆知識・教育系（#66-75） =====
  {
    post_number: 66,
    category: 'knowledge',
    hashtags: ['Pivolink', 'QRコード'],
    content: `【豆知識】QRコードの寿命は？

QRコード自体に寿命はありません。
問題は「リンク先の寿命」。

URLが変わった瞬間、QRコードは使えなくなる。

Pivolinkはリンク先を管理するので、
QRコードの実質的な寿命を「無期限」にできます。

#Pivolink #QRコード`,
  },
  {
    post_number: 67,
    category: 'knowledge',
    hashtags: ['QRコード', 'NFC'],
    content: `【知っておきたい】QRコードとNFCタグの違い：

QRコード → カメラで読み取り、距離OK、印刷コスト安
NFCタグ → スマホをかざす、近距離限定、タグ単価あり

共通の課題：「一度設置したら変更できない」

→ Pivolinkなら、どちらもリンク先を自由に変更。

#QRコード #NFC`,
  },
  {
    post_number: 68,
    category: 'knowledge',
    hashtags: ['Pivolink', 'QRコード'],
    content: `日本のQRコード利用率は世界トップクラス。

消費者は「QRを読み取る」行為に慣れています。

つまり、QRコードを活用したマーケティングは
「読み取ってもらえる確率が高い」ということ。

あとは中身（リンク先）を最適化するだけ。

#Pivolink #QRコード`,
  },
  {
    post_number: 69,
    category: 'knowledge',
    hashtags: ['Pivolink', 'SEO'],
    content: `【意外と知らない】リダイレクトの種類：

301 → 恒久的な転送（SEO評価も移転）
302 → 一時的な転送（元URLの評価を維持）
307 → 一時的な転送（POSTも維持）

Pivolinkは用途に応じて最適なリダイレクトを実行。
マーケティングの細部まで配慮しています。

#Pivolink #SEO`,
  },
  {
    post_number: 70,
    category: 'knowledge',
    hashtags: ['Pivolink', 'QRコード', 'マーケティング'],
    content: `【数字で見るQRコードの現在地】

・日本のQRコード決済利用者：約7,000万人
・世界のQRコード市場：2026年に約$35B
・消費者の60%以上がQR読み取り経験あり

QRコードはもはやインフラ。
その「中身の管理」に目を向ける時期です。

#Pivolink #QRコード #マーケティング`,
  },
  {
    post_number: 71,
    category: 'knowledge',
    hashtags: ['Pivolink'],
    content: `QRコードを「動的」にする方法は2つ：

① 短縮URLサービス → 安いが機能不足
② Pivolink → リダイレクト管理に特化

Pivolinkが短縮URLと違うのは：
・スケジュール切替
・デバイス別振分
・A/Bテスト
・クッションページ
・アクセス解析

#Pivolink`,
  },
  {
    post_number: 72,
    category: 'knowledge',
    hashtags: ['Pivolink', 'NFC'],
    content: `NFCタグの意外な活用先：

・ホテルの客室案内（テーブルに貼付）
・工場の機械メンテナンス記録（機器に貼付）
・ワインボトルの産地証明（ラベル内蔵）
・美術館の作品解説（展示台に埋込）

全てに共通：「情報は更新される」
NFCの中身を変えるより、リンク先を変える方が賢い。

#Pivolink #NFC`,
  },
  {
    post_number: 73,
    category: 'knowledge',
    hashtags: ['Pivolink', 'O2O', 'マーケティング'],
    content: `オフラインとオンラインを繋ぐ「O2O」の鍵はQRコード。

でも、従来のQRコードは：
× 効果測定ができない
× リンク切れのリスク
× A/Bテストができない

Pivolinkを挟むだけで全部解決。

#Pivolink #O2O #マーケティング`,
  },
  {
    post_number: 74,
    category: 'knowledge',
    hashtags: ['Pivolink', 'QRコード'],
    content: `QRコード活用で失敗する3大パターン：

1. リンク先が404 → 信頼失墜
2. キャンペーン終了後も古い情報に飛ぶ → 機会損失
3. 効果が計測できない → PDCAが回せない

3つとも、Pivolink導入で解決します。

#Pivolink #QRコード`,
  },
  {
    post_number: 75,
    category: 'knowledge',
    hashtags: ['Pivolink', 'QRコード', 'トレンド'],
    content: `2026年、QRコード市場のトレンド：

・パッケージ × QR（食品のトレーサビリティ）
・NFC × リテール（タッチで即座に情報取得）
・ダイナミックQR（リンク先を動的に変更）

3つ目の「ダイナミックQR」、
まさにPivolinkが提供している機能です。

#Pivolink #QRコード #トレンド`,
  },

  // ===== カテゴリF: キャンペーン・CTA（#76-85） =====
  {
    post_number: 76,
    category: 'campaign',
    hashtags: ['Pivolink'],
    content: `【ベータ特典】
今なら全有料プラン20%OFF。

Pro: ¥980 → ¥780/月
Business: ¥4,980 → ¥3,980/月

Freeプランも3リンクまで無料。
カード登録不要で今すぐ始められます。

https://redirect.tsuratsura.com

#Pivolink`,
  },
  {
    post_number: 77,
    category: 'campaign',
    hashtags: ['Pivolink'],
    content: `Pivolinkの無料プラン、こんな方におすすめ：

・まずは1つQRコードを試してみたい
・個人の名刺にQRをつけたい
・小規模店舗で1-2個だけ使いたい

3リンク / 月1,000アクセスまで無料。
カード登録不要。メールだけでOK。

https://redirect.tsuratsura.com

#Pivolink`,
  },
  {
    post_number: 78,
    category: 'campaign',
    hashtags: ['Pivolink', 'コスト削減'],
    content: `「Pivolinkって具体的にいくら得するの？」

仮に：
・チラシ5,000枚 × 印刷費10円 = 50,000円/回
・年4回キャンペーン = 200,000円

Pivolink Pro（年額¥9,360）で印刷を1回に減らせば、
年間約15万円の削減。ROI、すぐ出ます。

#Pivolink #コスト削減`,
  },
  {
    post_number: 79,
    category: 'campaign',
    hashtags: ['Pivolink'],
    content: `「無料ツールでQRコード作ればいいじゃん」

はい、作るだけなら無料ツールで十分です。

でもこんなことが必要なら、Pivolinkの出番：
・リンク先を後から変えたい
・いつ何回スキャンされたか知りたい
・A/Bテストで効果を比較したい

「作る」と「運用する」は別物です。

#Pivolink`,
  },
  {
    post_number: 80,
    category: 'campaign',
    hashtags: ['Pivolink'],
    content: `今日からPivolinkを始めたら、
明日にはQRコードを印刷に出せます。

1. アカウント作成（1分）
2. リンク発行（30秒）
3. QRコードをダウンロード（10秒）

あとは印刷屋さんに入稿するだけ。

https://redirect.tsuratsura.com

#Pivolink`,
  },
  {
    post_number: 81,
    category: 'campaign',
    hashtags: ['Pivolink'],
    content: `Pivolink、こんな規模感の方に使っていただいてます：

・個人事業主（名刺・ショップカード）
・中小企業（チラシ・パンフレット・展示会）
・チェーン店（全店舗のQR一括管理）
・メーカー（パッケージ・製品ラベル）

規模を問わず、QRコードを使うなら。

#Pivolink`,
  },
  {
    post_number: 82,
    category: 'campaign',
    hashtags: ['Pivolink', '販促'],
    content: `来月のキャンペーン、チラシの入稿締め切りが迫ってる？

大丈夫、PivolinkのURLでQRコードを作れば
キャンペーン内容が確定してなくても入稿できます。

リンク先は後から設定すればOK。

「入稿に間に合わない」ストレスから解放。

#Pivolink #販促`,
  },
  {
    post_number: 83,
    category: 'campaign',
    hashtags: ['Pivolink'],
    content: `年額プランなら、さらに約17%OFF。

Pro 年額: ¥7,800（月額換算 ¥650）
Business 年額: ¥39,800（月額換算 ¥3,317）

QRコード・NFCタグを年間通して使うなら、
年額プランが断然お得です。

#Pivolink`,
  },
  {
    post_number: 84,
    category: 'campaign',
    hashtags: ['Pivolink'],
    content: `Pivolink、フィードバック大歓迎です。

「こんな機能がほしい」
「ここが使いにくい」
「この業界でこう使いたい」

ベータ版だからこそ、皆さんの声で進化します。
サービス内のお問い合わせ or このアカウントへのDMで。

#Pivolink`,
  },
  {
    post_number: 85,
    category: 'campaign',
    hashtags: ['Pivolink'],
    content: `Pivolinkを試すのに理由は要りません。

無料
カード登録不要
1分で始められる
3リンクまで使える

「ちょっと試してみよう」で始めた方が、
一番長く使い続けてくれています。

https://redirect.tsuratsura.com

#Pivolink`,
  },

  // ===== カテゴリG: 信頼構築・エンゲージメント（#86-100） =====
  {
    post_number: 86,
    category: 'engagement',
    hashtags: ['Pivolink', 'スタートアップ'],
    content: `Pivolinkを作ったきっかけ：

キャンペーンが変わるたびにQRコードを刷り直す。
NFCタグを毎月書き換える。

「これ、リンク先だけ変えればいいのでは？」

そう思ったのが開発のきっかけでした。

#Pivolink #スタートアップ`,
  },
  {
    post_number: 87,
    category: 'engagement',
    hashtags: ['Pivolink', '大阪', 'スタートアップ'],
    content: `Pivolinkは大阪発のSaaSです。

株式会社TSURATSURAが開発・運営しています。
小さなチームですが、ユーザーの声を素早く反映して
日々プロダクトを改善しています。

#Pivolink #大阪 #スタートアップ`,
  },
  {
    post_number: 88,
    category: 'engagement',
    hashtags: ['Pivolink', 'QRコード'],
    content: `「QRコードのリンク先を変えたい」

この検索をしたことがある方、
Pivolinkはまさにあなたのために作りました。

https://redirect.tsuratsura.com

#Pivolink #QRコード`,
  },
  {
    post_number: 89,
    category: 'engagement',
    hashtags: ['Pivolink'],
    content: `Pivolinkの開発で大切にしていること：

・シンプルに使えること
・必要な機能が揃っていること
・余計な機能で迷わせないこと

「説明書なしで使える」が目標です。

#Pivolink`,
  },
  {
    post_number: 90,
    category: 'engagement',
    hashtags: ['Pivolink', 'QRコード'],
    content: `質問です。

あなたの会社で、QRコードを使っている場所はいくつありますか？

・名刺
・チラシ
・パンフレット
・パッケージ
・店頭POP
・看板

それぞれ、リンク先が変わったらどうしますか？

#Pivolink #QRコード`,
  },
  {
    post_number: 91,
    category: 'engagement',
    hashtags: ['Pivolink'],
    content: `Pivolinkのユーザーから嬉しい声：

「展示会のパンフに載せたQRを、展示会後に自社サイトに切り替えたら、そこから問い合わせが来た」

印刷物を"使い捨て"にしない。
それだけで、販促効果が延長されます。

#Pivolink`,
  },
  {
    post_number: 92,
    category: 'engagement',
    hashtags: ['Pivolink'],
    content: `今後のPivolink開発ロードマップ：

・カスタムドメイン（独自ドメインでリダイレクト）
・チーム管理（メンバー招待・権限設定）
・API提供（外部システム連携）
・Slack / メール通知連携

ご要望があればお気軽にDMを。

#Pivolink`,
  },
  {
    post_number: 93,
    category: 'engagement',
    hashtags: ['Pivolink', 'マーケティング'],
    content: `「QRコードってどうやって効果測定するの？」

これ、よく聞かれます。

答え：PivolinkのQRコードなら、
管理画面で全部見えます。

・何回スキャンされたか
・どのデバイスからか
・いつスキャンされたか

紙媒体の効果測定、できます。

#Pivolink #マーケティング`,
  },
  {
    post_number: 94,
    category: 'engagement',
    hashtags: ['Pivolink'],
    content: `Pivolinkは「ないと困る」より「あると全然違う」系のツールです。

QRコードはPivolinkなしでも作れる。
でも一度使うと、もうPivolinkなしには戻れない。

それくらい「当たり前のもったいない」を解消します。

#Pivolink`,
  },
  {
    post_number: 95,
    category: 'engagement',
    hashtags: ['Pivolink', 'QRコード'],
    content: `毎週金曜に、Pivolinkの活用Tipsを投稿します。

業種別の使い方、設定のコツ、マーケティングへの応用など。

フォローしておくと、QRコード・NFCタグ活用の
アイデアが毎週届きます。

#Pivolink #QRコード`,
  },
  {
    post_number: 96,
    category: 'engagement',
    hashtags: ['Pivolink'],
    content: `Pivolinkを使い始めて最初に感じること：

「あ、今まで刷り直してたのは何だったんだ」

そう思っていただけたら、私たちの勝ちです。

#Pivolink`,
  },
  {
    post_number: 97,
    category: 'engagement',
    hashtags: ['Pivolink'],
    content: `個人的に一番好きな機能は「スケジュール切替」。

設定したら忘れていい。
指定日時に勝手にリンク先が切り替わる。

「キャンペーン始まったのにURL変えるの忘れてた！」
が、物理的に起こらなくなります。

#Pivolink`,
  },
  {
    post_number: 98,
    category: 'engagement',
    hashtags: ['Pivolink'],
    content: `PivolinkのFreeプラン、意外と使えます。

3リンクあれば：
① 名刺のQR
② 店舗のPOP
③ SNSプロフィールリンク

この3つだけでも「後から変更できる安心感」は絶大。

#Pivolink`,
  },
  {
    post_number: 99,
    category: 'engagement',
    hashtags: ['Pivolink', 'QRコード', 'NFC'],
    content: `このアカウントでは以下を発信します：

・QRコード / NFCタグの活用ノウハウ
・Pivolinkの新機能・アップデート情報
・業種別の導入事例
・マーケティング × テクノロジーのTips

QRコード・NFCを活用したい方、フォローお願いします。

#Pivolink #QRコード #NFC`,
  },
  {
    post_number: 100,
    category: 'engagement',
    hashtags: ['Pivolink'],
    content: `最後まで読んでくださった方へ。

Pivolinkは、まだベータ版です。
でも、使っていただければ「これ、なんで今までなかったの？」と思っていただける自信があります。

QRコードを"使い捨て"にしない世界を、一緒に。

https://redirect.tsuratsura.com

#Pivolink`,
  },
]
