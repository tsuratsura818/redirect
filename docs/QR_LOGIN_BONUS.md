# QRログインボーナス（QRスキャン → どこポイ ポイント付与）設計書

作成日: 2026-05-20 / 対象: Pivolink + Shopify(どこポイ)

## 1. ゴール

印刷済みの Pivolink QR コードをスキャンすると、**ログイン済みの Shopify 顧客に「ログインボーナス」としてポイント（どこポイ）を付与する**。
重複防止ルール: **1顧客あたり1日1回**（同じQRを何度スキャンしても、その日2回目以降は付与しない）。

## 2. なぜ「そのまま」では実現できないか（前提整理）

| 要素 | 単体でできること | できないこと |
|---|---|---|
| Pivolink | QRを読んだ人をURLへ転送・スキャン計測 | 「誰が」スキャンしたか不明。ポイントの概念なし |
| どこポイ | Shopify Flow の「ポイントを付与する」アクションでポイント加算 | トリガーは Shopify標準イベントのみ。「QRスキャン」を起点にできない。付与には `shopify_customer_id` が必須 |

→ **2つのギャップ**を埋める連携層が必要:
1. **顧客の特定** — スキャンした人がどの Shopify 顧客かを、なりすまし不可能な形で知る
2. **Flow の起点づくり** — どこポイを動かす Shopify イベント（顧客タグ追加）を発生させる

## 3. 全体フロー

```
[利用者] QRをスキャン
   │
   ▼
[Pivolink] GET /r/{slug}
   │  default_url にセットした App Proxy URL へ 302
   ▼
https://{shop}/apps/qr-bonus              ← Shopify App Proxy
   │  Shopify が logged_in_customer_id と signature を付与して中継
   ▼
[Pivolink] GET /api/shopify/qr-bonus      ← App Proxy のバックエンド（新規実装）
   │  1. App Proxy の HMAC 署名を検証
   │  2. logged_in_customer_id を取得
   │     └─ 未ログイン → /account/login?return_url=... へ 302（ログイン後に戻る）
   │  3. 重複チェック（Supabase / shop+customer+JST日付 でユニーク）
   │     └─ 当日付与済み → 「本日は付与済み」ページを返す
   │  4. 顧客に Admin API でタグ `qr-login-bonus` を付与
   │  5. 「ポイント付与しました」ページを返す
   ▼
[Shopify Flow] トリガー「顧客タグが追加された」（tag = qr-login-bonus）
   │  アクション1: どこポイ「ポイントを付与する」（customer.id, N pt）
   │  アクション2: Shopify「顧客タグを削除」（qr-login-bonus を除去）
   ▼
[どこポイ] 顧客にポイント加算 → 完了
```

タグを毎回 付与→削除 することで、翌日スキャン時に再び「タグ追加」イベントが発火する（既に付いているタグを足し直しても Flow は発火しないため）。

## 4. なぜ App Proxy を使うのか（セキュリティ）

ポイントは金銭価値があるため、顧客特定は**改ざん不能**でなければならない。

- **採用案: Shopify App Proxy** — `https://{shop}/apps/...` へのアクセスを Shopify が自社サーバへ中継する際、`logged_in_customer_id` を付与し、全クエリを App の API secret で HMAC 署名する。サーバ側で署名検証すれば、ログイン顧客IDを**信頼できる値**として扱える。
- **不採用案: テーマ snippet が `customer.id` を JS で送る方式**（gated-access のメール照合と同系統）— ブラウザから任意の顧客IDを送れてしまい**なりすまし可能**。ポイント付与には使えない。

> 注: App Proxy は Shopify Admin の「アプリ開発（Develop apps）」で作るカスタムアプリでは設定できない。**Shopify Partner Dashboard で作るアプリ**（またはCLIアプリ）が必要。Admin API トークンと API secret も同じアプリから取得する。

## 5. 詳細設計

### 5.1 Shopify アプリ（App Proxy）

対象ストアごとに1つ、Partner Dashboard でアプリを作成し、対象ストアにインストールする。

- **App Proxy 設定**
  - Subpath prefix: `apps`
  - Subpath: `qr-bonus`
  - Proxy URL: `https://redirect.tsuratsura.com/api/shopify/qr-bonus`
  - → 公開URL: `https://{shop}/apps/qr-bonus`
- **Admin API スコープ**: `read_customers`, `write_customers`（タグ付与/削除のため）
- 取得する値:
  - **API secret key** — App Proxy 署名検証に使用
  - **Admin API access token**（`shpat_...`） — タグ付与/削除に使用

### 5.2 Pivolink エンドポイント `/api/shopify/qr-bonus`（新規実装）

`src/app/api/shopify/qr-bonus/route.ts` を新規作成。**GET** で受ける（QRスキャン＝ブラウザ遷移のため）。

処理:

1. **署名検証** — クエリから `signature` を除外し、残りをキー昇順で `key=value` を区切り無しで連結 → API secret で HMAC-SHA256(hex) → `signature` と定数時間比較。不一致なら 403。
2. **ストア判定** — クエリの `shop`（App Proxy が付与）から対象ストアを特定し、対応する secret/token を選択。
3. **ログイン判定** — `logged_in_customer_id` が空 → `https://{shop}/account/login?return_url=%2Fapps%2Fqr-bonus` へ 302。
4. **重複チェック＆予約** — Supabase `qr_bonus_claims` に `(shop_domain, shopify_customer_id, claim_date=JST今日)` を INSERT。
   - UNIQUE 制約違反（既に当日行あり）→ 「本日のログインボーナスは受取済み」ページを返して終了。
   - 成功 → 次へ。
5. **タグ付与** — Admin API `customerUpdate`（または `tagsAdd`）で顧客に `qr-login-bonus` を追加。
6. **完了ページ** — 「ログインボーナス {N}ポイントを獲得しました」HTMLを返す（数秒後にストアTOPへ自動遷移、または「お買い物へ」ボタン）。

JST 日付の算出（Vercel は UTC 実行のため必須。[既知バグ](../supabase/) 参照）:
```ts
const jstDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date()) // → "2026-05-20"
```

App Proxy 署名検証（概略）:
```ts
function verifyProxySignature(searchParams: URLSearchParams, secret: string): boolean {
  const sig = searchParams.get('signature') ?? ''
  const params: string[] = []
  for (const [k, v] of [...searchParams.entries()].filter(([k]) => k !== 'signature')) {
    params.push(`${k}=${v}`)
  }
  const message = params.sort().join('') // 区切り無しで連結
  const digest = crypto.createHmac('sha256', secret).update(message).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig))
}
```

### 5.3 Supabase テーブル `qr_bonus_claims`（新規マイグレーション）

```sql
CREATE TABLE IF NOT EXISTS qr_bonus_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain          VARCHAR(255) NOT NULL,
  shopify_customer_id  BIGINT       NOT NULL,
  claim_date           DATE         NOT NULL,          -- JST日付
  qr_code_id           UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  points               INTEGER,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (shop_domain, shopify_customer_id, claim_date)
);
CREATE INDEX IF NOT EXISTS idx_qr_bonus_claims_lookup
  ON qr_bonus_claims (shop_domain, shopify_customer_id, claim_date);

ALTER TABLE qr_bonus_claims ENABLE ROW LEVEL SECURITY;
-- 書き込みは service_role（サーバ）のみ。公開ポリシーは付けない。
```

- **UNIQUE 制約が「1日1回」を原子的に保証する**（アプリ側の判定レースに依存しない）。
- 重複防止の単位は `(shop, customer, claim_date)` =「ストア単位で1日1回」。
  - 別案: `qr_code_id` も含めれば「QRキャンペーンごとに1日1回」。複数のボーナスQRを別々に回したい場合はこちら（要確認 → §10）。

### 5.4 顧客タグと Shopify Flow

- 連携タグ: `qr-login-bonus`
- Flow ワークフロー（Shopify Flow アプリで作成・無料）:
  - **トリガー**: 「顧客タグが追加されました（Customer tags added）」
  - **条件**: `customer.tags` に `qr-login-bonus` を含む
  - **アクション1**: どこポイ「ポイントを付与する」（§5.5）
  - **アクション2**: Shopify「顧客タグを削除（Remove customer tags）」→ `qr-login-bonus`
- タグを削除することで、翌日の付与時に「タグ追加」が再び発火する。

### 5.5 どこポイ アクション設定

Flow アクション「ポイントを付与する」のパラメータ:

| パラメータ | 値 |
|---|---|
| `shopify_customer_id`（必須） | `{{customer.id}}`（`gid://shopify/Customer/...`） |
| `dokopoi_points_adding`（必須） | 付与ポイント数（例: `50`） |
| `dokopoi_points_adding_expire_date`（任意） | 有効期限日数（既定365日） |
| `dokopoi_ext_point_label`（任意） | `QRログインボーナス`（管理画面表示用） |

前提: 対象ストアに **どこポイ** と **Shopify Flow** がインストール済みで、どこポイのプランが Flow 連携に対応していること。

### 5.6 Pivolink QR 設定

- ボーナス用 QR を Pivolink で1つ作成。
- その QR の `default_url` を **App Proxy の公開URL** にする:
  `https://{shop}/apps/qr-bonus`
- Pivolink 本体のコード変更は不要（任意URLへ転送する既存機能で足りる）。スキャン数計測・後からの差し替え・有効期限は Pivolink の標準機能がそのまま使える。
- クッションページは付けない（即時に App Proxy へ転送）。

## 6. 重複防止（1日1回）の流れ

```
スキャン → /api/shopify/qr-bonus
  → qr_bonus_claims に (shop, customerId, JST今日) を INSERT
       ├─ 成功      → タグ付与 → Flow → どこポイ加算 → 「獲得しました」
       └─ UNIQUE違反 → 付与処理スキップ → 「本日は受取済み」
```

- 翌日は `claim_date` が変わるため再度 INSERT 成功 → 付与される。
- タグ付与より先に INSERT（予約）するため、二重送信・リトライでも二重付与しない。

## 7. エラー / エッジケース

| ケース | 挙動 |
|---|---|
| 未ログイン | `/account/login?return_url=...` へ誘導。ログイン後に戻り付与 |
| 署名検証失敗 | 403。App Proxy 経由でない不正アクセスを遮断 |
| 当日付与済み | 「本日は受取済み」ページ（エラーではない） |
| Admin API 失敗 | INSERT 済み行を削除（ロールバック）し、リトライ可能にする。ユーザーには再試行案内 |
| Flow 未設定 / どこポイ未導入 | タグは付くがポイント加算されない → §8 のセットアップ完了が前提 |
| 同一メールで複数顧客 | App Proxy の `logged_in_customer_id` は単一顧客IDなので問題なし |

## 8. セットアップ手順チェックリスト

対象ストアごとに:

- [ ] Shopify Flow をインストール（無料）
- [ ] どこポイをインストール、Flow連携対応プランを確認
- [ ] Partner Dashboard でアプリ作成、対象ストアにインストール
  - [ ] App Proxy: prefix=`apps`, subpath=`qr-bonus`, URL=`https://redirect.tsuratsura.com/api/shopify/qr-bonus`
  - [ ] スコープ: `read_customers`, `write_customers`
  - [ ] API secret key と Admin API token を控える
- [ ] Pivolink に Supabase マイグレーション `qr_bonus_claims` を適用
- [ ] Pivolink に環境変数を登録（§9）してデプロイ
- [ ] Shopify Flow ワークフロー作成（§5.4）
- [ ] Pivolink でボーナス用 QR を作成、`default_url` を App Proxy URL に設定
- [ ] テスト: ログイン状態でスキャン → ポイント加算を確認 / 同日2回目は付与されないことを確認 / 未ログインでスキャン → ログイン誘導を確認

## 9. 環境変数（Pivolink / Vercel）

複数ストア対応のため gated-access と同様にストア別キーで持つ:

```
SHOPIFY_QRBONUS_STORES = itowocashi.myshopify.com,...     # 対象 myshopify ドメイン一覧
SHOPIFY_APP_SECRET_<STORE>   = <App Proxy 署名検証用 API secret>
SHOPIFY_ADMIN_TOKEN_<STORE>  = shpat_...                  # タグ付与用
QRBONUS_POINTS               = 50                         # 付与ポイント数（任意・既定値）
```

`<STORE>` は myshopify ドメインを大文字化し非英数字を `_` に置換（例: `ITOWOCASHI_MYSHOPIFY_COM`）。

## 10. 実装タスクと未確定事項

### 実装タスク（Pivolink 側）
1. マイグレーション `supabase/qr-bonus-migration.sql`（`qr_bonus_claims`）— ✅実装済
2. API ルート `src/app/api/shopify/qr-bonus/route.ts`（署名検証 / ログイン判定 / 重複 / タグ付与 / 完了ページ）— ✅実装済
3. 環境変数の登録（§9）とデプロイ — ⬜未

> middleware（`src/lib/supabase/middleware.ts`）は `/dashboard` と一部 JPYC パスのみを保護する方式のため、`/api/shopify/qr-bonus` は既定で公開アクセス可能。proxy.ts の変更は不要。

### Shopify 側タスク
- Partner アプリ作成 + App Proxy 設定、Flow ワークフロー作成、どこポイ設定（コード不要・管理画面操作）

### 要確認事項
- **対象ストア**: どのストアで実施するか（いとをかし `itowocashi.com` 等）
- **付与ポイント数**と**有効期限**
- 重複防止の単位: 「ストア単位で1日1回」か「QRキャンペーンごとに1日1回」か（§5.3）
- 未ログイン者を**ログインへ誘導するか**、**新規会員登録へ誘導するか**（新規登録ボーナスと組み合わせる場合）

## 11. 参考

- どこポイ: <https://apps.shopify.com/dokopoi> / <https://dokopoi.rewired.jp/>
- どこポイ Flow アクション仕様: <https://dokopoi.rewired.jp/blogs/manual/shopify-flow-dokopoi-acctions>
- 流用元の同型パターン: `AllProject/gated-access`（Flow + 顧客タグ + Worker）
