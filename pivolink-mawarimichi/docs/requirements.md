# 要件定義 — Pivolink まわりみち（京都モデル）

## 1. 概要
目的地選択型・動的QR周遊による観光分散サービス。詳細コンセプトは同梱の企画書HTML参照。
ターゲット: (a)発注者=自治体/DMO/観光協会/商店街 (b)体験者=国内観光客・インバウンド(2025年 訪京外国人1,268万人)

## 2. 機能一覧

| ID | 機能 | Phase |
|---|---|---|
| F01 | QR着地・スタート/スポット分岐（固定QR×可変遷移先） | 1 |
| F02 | 目的地選択（プリセット3件） / 自由入力 | 1 / 2 |
| F03 | 回廊ルーティング二択抽選（tolerance 220m・重み付き） | 1 |
| F04 | 匿名セッション・PIIゼロ | 1 |
| F05 | デジタルスタンプ（二重押印防止・レア判定サーバー側） | 1 |
| F06 | 区間ナビ ディープリンク（Google/Apple出し分け・クリック記録） | 1 |
| F07 | 距離バー・まわりみち率算出 | 1 |
| F08 | クーポン発行・店舗提示 | 1 |
| F09 | 多言語 ja/en → +zh/ko | 1 → 2 |
| F10 | ナビキャラ台詞システム（差し替え可能） | 1(仮) |
| F11 | 管理: スポットCRUD・重み調整・QR発行 | 1 |
| F12 | 回遊レポート（分散率・ルート・ナビ利用率） | 1 |
| F13 | 混雑連動ルール | 2 |
| F14 | スポンサーCM（15秒・スキップ可・頻度制御・完視聴ログ） | 2 |
| F15 | 月次レポート出力（補助金申請フォーマット） | 2 |
| F16 | セルフサーブ・マルチテナント・Stripe | 3 |

## 3. データベース
`supabase/migrations/0001_init.sql` 参照。campaigns / goals / spots / routing_rules /
sessions / scans / coupons / sponsors / cm_assets / cm_impressions。

## 4. 非機能
- LCP 2.5s以内（屋外4G想定。スポット画像はnext/image + AVIF）
- アクセシビリティ: フォーカスリング維持・prefers-reduced-motion対応（モックアップ準拠）
- セキュリティ: RLS全テーブル / QRトークンは推測不能（署名 or 128bit乱数）/ レート制限
- AEO: TouristAttraction / Organization / FAQPage JSON-LD、AIクローラー許可

## 5. 受け入れ基準（Phase 1完了の定義）
1. 実機QRスキャン→目的地選択→5スポット→到着まで通しで完走できる（ja/en）
2. ルーティングテスト: 3目的地×1000周で二択破綻0件・ユニークルート400通り以上
3. 同一スポット再スキャンでスタンプが増えない（DB一意制約で担保）
4. ナビリンクが各区間で正しい座標を開き、最終区間まで目的地座標が露出しない
5. 管理画面から重みを変更→次の抽選に即時反映
6. レポート画面で分散状況とまわりみち率の実測値が確認できる
7. Lighthouse: Performance/Accessibility 90+（参加者ページ）

## 6. KPI・計測イベント
scan（スポット別）/ choice_shown vs choice_taken（提示無視率）/ nav_click /
coupon_issue・coupon_use / cm_view・cm_complete / session_complete率 / まわりみち率分布
