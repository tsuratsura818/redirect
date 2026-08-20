# Pivolink まわりみち — 京都モデル

動的QR周遊「まわりみち」。QRコードを変えずに行き先だけを動的に変え、
観光客が選んだ**目的地への回廊**の中で寄り道スポットを抽選する、オーバーツーリズム分散サービス。

Phase 1（実証MVP）実装済み。Supabase未接続の状態でも**インメモリのデモモード**で通しで動く。

## クイックスタート

```bash
npm install
cp .env.example .env.local     # QR_TOKEN_SECRET と ADMIN_PASSWORD だけ入れれば動く
npm run dev                    # http://localhost:3000
```

`/` を開くとスタートQRの着地画面（＝サイネージのQRを読んだ状態）になります。
Supabaseのenvが無い場合は自動でインメモリのデモモードになり、画面上部に DEMO バンドが出ます。

管理画面は `/admin`（`ADMIN_PASSWORD`。未設定なら開発時のみ `mawarimichi`）。

## コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` / `build` / `start` | 開発 / ビルド / 本番起動 |
| `npm test` | ルーティングエンジンのユニットテスト（受け入れ基準の検証を含む） |
| `npm run sim` | ルーティングのシミュレータ。ルール設定の効き方を実測する |
| `npm run e2e` | 参加者フローの通し確認（要: サーバー起動） |
| `npm run e2e:admin` | 管理フローの通し確認（重み変更→即時反映の確認を含む） |
| `npm run gen:seed` | `src/data/seed.ts` から投入用SQLを生成 |

## ファイル索引

| パス | 役割 |
|---|---|
| `CLAUDE.md` | ★実装指示書。仕様・制約・やってはいけないこと |
| `TASKS.md` | Phase別タスクと受け入れ基準の状況 |
| `docs/requirements.md` | 要件定義（機能一覧・受け入れ基準・KPI） |
| `docs/pivolink-kyoto-proposal.html` | 自治体・DMO向け企画書（A4横9枚） |
| `mockup/pivolink-kyoto-spot-mockup.html` | 観光客体験のモックアップ。**UI/UXの正** |
| `src/lib/routing.ts` | ★回廊ルーティングエンジン（純関数） |
| `src/data/seed.ts` | ★シードデータの正。SQLはここから生成する |
| `supabase/migrations/0001_init.sql` | DB初期スキーマ（RLS込み・冪等） |
| `supabase/migrations/0002_seed_kyoto.sql` | 京都モデルのシード（生成物） |

## デモのしかた

```bash
npm run build && npm start      # http://localhost:3939 相当（既定は3000）
```

ブラウザで `/` を開くと、サイネージのQRを読んだ状態から始まります。
目的地を選ぶ → 二択 → 現地QR（デモボタン）→ スタンプ → 5個で到着、まで通しで動きます。
到着画面には**歩いた道のりと最短ルートを重ねた地図**が出ます。

★ローカル（単一プロセス）でのみ通しで動きます。**Vercel等のサーバーレスに出す場合は
Supabase接続が必須**です（インメモリだとリクエストごとにインスタンスが変わり、
目的地とスタンプが消えます）。

## 本番（Supabase）に切り替える手順

1. Supabaseプロジェクトを作る
2. SQL Editor で `0001_init.sql` → `0002_seed_kyoto.sql` の順に実行
3. `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` を入れる
4. 再起動すると自動でSupabase側に切り替わる（DEMOバンドが消える）
5. **本番の看板用QRトークンを再発行**してから `/admin/qr` で入稿用PNGを出す

## プレースホルダ一覧（実装時に置換）

- `{ドメイン}` — 本番ドメイン（未取得）。`NEXT_PUBLIC_APP_URL` に入れる
- 実在スポット名（六波羅蜜寺 ほか）— **許諾未取得。対外公開前に許諾 or 差し替え**
- ナビキャラ「案内狐・コン」— コラボキャラ確定までの仮キャラ
- d食堂のコラボ特典文言 — デモ表記。実契約前に削除・差し替え
- QRトークン `dev-*` — 開発用の固定値。**印刷入稿前に本番トークンを再発行する**

## 検証済み事項（2026-08-03）

- ルーティング: 3目的地×1000周×3シードで**二択破綻0件**。
  ユニークルートは清水寺（最も回廊が狭い・ピーク帯13時）で 408〜440通り、
  八坂神社 462〜498、錦市場 580〜615。まわりみち率の中央値は 204〜273%
- 参加者フロー: QR着地→目的地選択→5スポット→到着まで通しでパス（`npm run e2e`）
- 二重押印なし・最終区間まで目的地座標が露出しないことを自動確認
- 管理: 重み変更が次の抽選に即時反映（bukkoji 出現率 26% → 86%）
- 未検証: Lighthouse スコア、実機QRスキャン、Supabase接続時の挙動
