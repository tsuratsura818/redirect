# Pivolink Mobile App - CLAUDE.md

## プロジェクト概要

Pivolink（QR/NFCリダイレクト管理SaaS）のモバイルアプリ版。
既存のNext.js Webアプリを **Capacitor** でiOS/Androidネイティブアプリ化する。

### コンセプト

- **Web版 = 管理・設定の司令塔**（QR作成・編集・解析ダッシュボード・Stripe課金管理）
- **アプリ版 = 現場で使うツール**（NFCタグ読み書き・QRスキャン・プッシュ通知・ワンタップ共有）
- **課金はWeb側のStripeに一元化**（アプリ内課金は使わない → Apple/Google手数料30%を回避）

### Web版 vs アプリ版 機能比較

| 機能 | Web版 | アプリ版 |
|------|:-----:|:-------:|
| QRコード作成・編集 | ✅ | ✅ |
| リダイレクト先の設定・変更 | ✅ | ✅ |
| アクセス解析ダッシュボード | ✅（フル） | ✅（簡易ビュー） |
| Stripe課金・プラン管理 | ✅ | ❌（Webに誘導） |
| NFCタグ読み取り | ❌ | ✅ アプリ限定 |
| NFCタグ書き込み | ❌ | ✅ アプリ限定 |
| カメラQRスキャン→即編集 | ❌ | ✅ アプリ限定 |
| プッシュ通知（アクセス急増等） | ❌ | ✅ アプリ限定 |
| QR画像ワンタップ保存・共有 | △（ダウンロード） | ✅（ネイティブ共有シート） |

### アカウント共有

- Web版とアプリ版は **同じSupabase Authアカウント** でログイン
- 同じメール/パスワードで両方利用可能。データはクラウド（Supabase）で自動同期
- 想定ユースケース: 「PCのWeb版で設定を作り込み → 現場ではアプリでスキャン・NFC操作」
- 複数デバイス同時ログイン対応（スマホ + PC同時利用OK）

---

## プロダクトポジショニング

### 競合比較: NFC Tools（wakdev.com）との違い

| 観点 | NFC Tools | Pivolink アプリ版 |
|------|-----------|-------------------|
| 目的 | 汎用NFCツール（URL・テキスト・連絡先等なんでも書ける） | Pivolinkリダイレクト専用ツール |
| 書き込み後の変更 | **不可**（タグを物理的に書き換える必要あり） | **いつでも可能**（管理画面でリダイレクト先を変更するだけ） |
| 書き込むデータ | 最終的な宛先URL（例: `example.com/menu`） | PivolinkリダイレクトURL（例: `pivolink.com/r/abc123`） |
| 操作の複雑さ | レコードタイプ選択→データ入力→書き込み（多機能ゆえ複雑） | リンク一覧から選ぶ→タグにかざすだけ（2ステップ） |
| アクセス解析 | なし | Pivolinkダッシュボードで閲覧数・デバイス等を確認可能 |
| QRコード連携 | なし | 同じリンクにQRコードも自動生成済み |
| 料金 | 無料（Pro版 $3.49） | Pivolink SaaSプランに含まれる（追加課金なし） |

### Pivolink NFC機能の核心的価値

**「NFCタグの中身は固定、飛び先だけ自由に変わる」**

- 飲食店: テーブルにNFCステッカー → 季節ごとにメニューページを差し替え
- イベント: 会場のNFCタグ → イベント前は告知、当日はタイムテーブル、終了後はアーカイブに自動切替
- 名刺: NFC名刺に埋め込み → 転職・部署異動時もURLそのまま、リダイレクト先だけ更新
- 物販: 商品タグ → キャンペーン期間だけ特設ページに飛ばし、通常時は商品詳細に戻す

NFCタグ自体は1枚数十円〜数百円。一度貼ったら物理的に剥がす必要がないのがPivolinkの価値。

---

## 技術スタック

### 既存（Web版）
- Next.js 16 / React 19 / TypeScript strict
- Tailwind v4 / shadcn/ui
- Supabase（PostgreSQL + Auth + Storage + Realtime）
- Stripe（Pro ¥980/月, Business ¥4,980/月）
- Vercel

### 追加（モバイル版）
- **Capacitor 6.x**（iOS/Android WebViewラッパー）
- **@capacitor/camera** — QRコードスキャン用カメラアクセス
- **@capacitor-community/nfc** — NFCタグの読み書き
- **@capacitor/push-notifications** — Firebase Cloud Messaging連携
- **@capacitor/share** — QRコード画像のネイティブ共有
- **@capacitor/filesystem** — QR画像のローカル保存
- **@capacitor/haptics** — 操作フィードバック
- **@capacitor/app** — アプリライフサイクル管理
- **@capacitor/status-bar** — ステータスバー制御

---

## ディレクトリ構成

```
pivolink/
├── CLAUDE.md                  # このファイル
├── capacitor.config.ts        # Capacitor設定
├── ios/                       # Xcodeプロジェクト（自動生成）
├── android/                   # Android Studioプロジェクト（自動生成）
├── src/
│   ├── app/                   # Next.js App Router（既存）
│   ├── components/
│   │   ├── mobile/            # モバイル専用コンポーネント
│   │   │   ├── QRScanner.tsx       # カメラQRスキャナー
│   │   │   ├── NFCReader.tsx       # NFCタグ読み取り（Pivolink URL検出→編集画面遷移）
│   │   │   ├── NFCWriter.tsx       # NFCタグ書き込み（リンク選択→タグにかざす→書き込み）
│   │   │   ├── NFCWriteStatus.tsx  # 書き込み結果（成功/失敗/リトライ）UI
│   │   │   ├── LinkSelector.tsx    # NFC書き込み用リンク選択リスト
│   │   │   ├── MobileNav.tsx       # モバイル用ボトムナビ
│   │   │   └── ShareSheet.tsx      # QR共有シート
│   │   └── ...                # 既存コンポーネント
│   ├── hooks/
│   │   ├── useNFC.ts               # NFC操作フック
│   │   ├── usePushNotifications.ts # プッシュ通知フック
│   │   ├── useQRScanner.ts         # QRスキャンフック
│   │   └── usePlatform.ts          # Web/iOS/Android判定フック
│   ├── lib/
│   │   ├── capacitor/
│   │   │   ├── nfc.ts              # NFCサービス
│   │   │   ├── push.ts             # プッシュ通知サービス
│   │   │   ├── share.ts            # ネイティブ共有
│   │   │   └── filesystem.ts       # ファイル保存
│   │   └── ...
│   └── ...
├── public/
├── supabase/
│   └── migrations/
│       └── 20260325_add_device_tokens.sql  # プッシュ通知用
├── package.json
└── .env.example
```

---

## Phase 1: Capacitor統合 & 基本セットアップ

### 1.1 Capacitor初期化

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Pivolink" "com.tsuratsura.pivolink"
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

### 1.2 capacitor.config.ts

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tsuratsura.pivolink',
  appName: 'Pivolink',
  webDir: 'out',  // Next.js static export
  server: {
    // 開発時はローカルサーバーに接続
    // url: 'http://localhost:3000',
    // cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;
```

### 1.3 Next.js Static Export対応

`next.config.ts` に以下を追加:

```typescript
const nextConfig = {
  output: 'export',  // Capacitor用の静的エクスポート
  // 注意: API RoutesはSupabase Edge Functionsに移行が必要
};
```

**重要**: `output: 'export'` にすると Server Components / API Routes / Middleware が使えなくなる。
- API Routes → Supabase Edge Functions に移行
- Server Components → Client Components に変換（必要な箇所のみ）
- Middleware → Capacitor側のルーティングで対応

### 1.4 プラットフォーム判定ユーティリティ

```typescript
// src/hooks/usePlatform.ts
import { Capacitor } from '@capacitor/core';

export const usePlatform = () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform(); // 'web' | 'ios' | 'android'

  return { isNative, platform, isWeb: !isNative, isIOS: platform === 'ios', isAndroid: platform === 'android' };
};
```

---

## Phase 2: モバイル専用機能

### 2.1 QRコードスキャナー

- カメラでQRコードを読み取り → リダイレクト先の編集画面に遷移
- `@capacitor/camera` + jsQR（デコードライブラリ）
- Web版にはこの機能なし（アプリの差別化ポイント）

### 2.2 NFCタグ読み書き

- `@capacitor-community/nfc` プラグイン使用
- **iOS**: Core NFC（iPhone 7以降、バックグラウンド読み取りはXS以降）
- **Android**: 標準NFC API

#### NFC書き込みフロー（メイン機能）

```
[リンク一覧画面] → リンクを選択
  → [NFC書き込み画面] 「NFCタグにかざしてください」表示
    → タグ検出 → PivolinkリダイレクトURL（例: pivolink.com/r/abc123）をNDEF URIレコードとして書き込み
      → 成功: ハプティクスフィードバック + 完了アニメーション
      → 失敗: リトライ促すUI（タグの容量不足・書き込みロック等のエラーハンドリング）
```

- 書き込むのは常にPivolinkのリダイレクトURL（最終宛先URLではない）
- これにより、タグを物理的に書き換えなくてもWeb管理画面からリダイレクト先を何度でも変更可能
- NFC Toolsのような汎用ツールとの決定的な差別化ポイント

#### NFC読み取りフロー

```
[NFC読み取り画面] → タグにかざす
  → pivolink.com/r/* パターンを検出
    → YES: 該当リンクの編集画面に遷移（リダイレクト先の変更、解析確認が即座にできる）
    → NO:  「このタグはPivolinkで管理されていません。書き込みますか？」→ 書き込みフローへ
```

#### NFC対応チェック

```typescript
// NFC非対応端末では機能自体を非表示にする
const { isNFCSupported } = useNFC();
if (!isNFCSupported) return null; // NFCタブ/ボタンを描画しない
```

#### NFCタグの仕様メモ

- 書き込みフォーマット: NDEF URI Record（Type: U）
- 推奨タグ: NTAG213（144バイト、PivolinkのURL長に十分）
- 書き込みロック機能: オプションで読み取り専用にロック可能（誤上書き防止）

### 2.3 プッシュ通知

- Firebase Cloud Messaging（FCM）で統一（iOS/Android両対応）
- 通知トリガー例:
  - QRコードのアクセス数が急増した時
  - 設定したリダイレクト先のURLがダウンした時
  - 月次レポート配信

### 2.4 QRコード共有・保存

- `@capacitor/share` でネイティブ共有シートを起動
- `@capacitor/filesystem` でQR画像をカメラロールに保存

---

## Phase 3: UI/UX対応

### 3.1 モバイル専用レイアウト

- ボトムナビゲーション（ホーム / スキャン / NFC / 設定）
- `usePlatform()` で Web/Native を判定し、レイアウトを切り替え
- Safe Area対応（iOS ノッチ / Dynamic Island）

### 3.2 レスポンシブ対応方針

- 既存のWeb UIはそのまま活用（Capacitor WebViewで表示）
- モバイル専用機能のみ追加コンポーネントで実装
- ボトムナビはネイティブアプリ時のみ表示

---

## Phase 4: ストア公開準備

### 4.0 費用まとめ

| 項目 | 費用 | 頻度 |
|------|------|------|
| Apple Developer Program | $99（約¥15,000） | 毎年 |
| Google Play Developer登録 | $25（約¥3,800） | 一回のみ |
| Firebase (FCM) | 無料枠で十分 | — |
| サーバー追加費用 | なし（既存Vercel + Supabase） | — |
| **合計初期費用** | **約¥19,000** | — |
| **ランニングコスト** | **約¥15,000/年**（Apple更新のみ） | — |

### 4.0.1 開発環境の要件

| 環境 | iOS開発 | Android開発 |
|------|---------|-------------|
| Mac | ✅ 必須（Xcode） | ✅ 対応 |
| Windows | ❌ 不可 | ✅ 対応 |
| Linux | ❌ 不可 | ✅ 対応 |
| ブラウザテスト | ✅ `npx cap serve`（ネイティブ機能除く） | ✅ 同左 |

- iOSシミュレーター: Xcode付属（Mac必須）
- Androidエミュレーター: Android Studio付属（全OS対応、無料）
- 注意: NFC機能は実機でのみテスト可能（シミュレーター/エミュレーターではNFC非対応）

### 4.1 Apple App Store

- Apple Developer Program登録（$99/年）
- App Store Connect でアプリ情報・スクリーンショット登録
- Xcodeで署名・ビルド → TestFlight → 審査提出
- **審査対策**: アプリ内課金を使わない旨の説明文を準備
  - 「本アプリはWeb版SaaSの補助ツールであり、課金機能はWebで完結する」

### 4.2 Google Play Store

- Google Play Developer登録（$25/一回）
- Android App Bundle (.aab) でビルド
- 内部テスト → オープンテスト → 製品版リリース

### 4.3 ストア素材

- アプリアイコン: 1024x1024（iOS）/ 512x512（Android）
- スクリーンショット: iPhone 6.7" / 6.1" / iPad, Android Phone / Tablet
- フィーチャーグラフィック: 1024x500（Google Play）
- 説明文（日本語 / 英語）

---

## DB Migration

```sql
-- 20260325_add_device_tokens.sql
-- プッシュ通知用デバイストークン管理テーブル

CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

-- RLSポリシー
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
  ON public.device_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- プッシュ通知設定テーブル
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  access_spike_alert BOOLEAN DEFAULT true,        -- アクセス急増通知
  url_down_alert BOOLEAN DEFAULT true,            -- リダイレクト先ダウン通知
  monthly_report BOOLEAN DEFAULT true,            -- 月次レポート通知
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON public.notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_atトリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_device_tokens_updated_at
  BEFORE UPDATE ON public.device_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## .env.example

```bash
# 既存（変更なし）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# モバイルアプリ追加分
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Capacitorビルド用（CI/CD）
APPLE_TEAM_ID=
APPLE_SIGNING_IDENTITY=
ANDROID_KEYSTORE_PATH=
ANDROID_KEYSTORE_PASSWORD=
```

---

## コーディングルール

- TypeScript strict モード必須、`any` 型禁止
- `console.log` をコミットに含めない
- コミットメッセージ: 英語プレフィックス + 日本語説明（例: `feat: QRスキャナーコンポーネント追加`）
- Capacitorプラグインは必ず `usePlatform()` でネイティブ判定してから呼び出す
- Web版でネイティブ専用機能を呼ぶとエラーになるため、フォールバック必須
- コンポーネントは `'use client'` を明示（Static Export制約）

---

## 実装順序

1. **Capacitor初期化 & Static Export対応**（基盤）
2. **プラットフォーム判定フック & モバイルレイアウト**（UI基盤）
3. **QRスキャナー実装**（最も価値が高い差別化機能）
4. **NFC読み書き実装**（アプリでしかできない機能）
5. **プッシュ通知実装**（Firebase + Supabase Edge Function）
6. **QR共有・保存機能**
7. **ストア素材作成 & 審査提出**

---

## Apple審査の注意点

- アプリ内課金なしの正当性を明記（Webサービスの補助ツール）
- プライバシーポリシーURL必須
- カメラ/NFC使用の理由を `Info.plist` に記載
- `NSCameraUsageDescription`: "QRコードをスキャンしてリダイレクト設定を管理するために使用します"
- `NFCReaderUsageDescription`: "NFCタグの読み書きでリダイレクト先を設定するために使用します"
- 最低限のネイティブ機能がないと「Webサイトのラッパー」として却下されるリスクあり → NFC/QRスキャン/プッシュ通知で十分にネイティブ価値を示す

---

## 既知の制約・リスク

| リスク | 対策 |
|--------|------|
| Static Export移行でAPI Routes使えない | Supabase Edge Functions に移行 |
| Apple審査で「Webラッパー」判定 | NFC・カメラ・プッシュ通知でネイティブ価値を明示 |
| iOS NFC制限（iPhone 7以降のみ） | 非対応端末ではNFC機能を非表示にする |
| アプリ内課金を使わないことへのApple指摘 | ガイドライン3.1.3(b)に基づき、Web SaaSの読み取り専用アプリとして申請 |
| FCMトークンの管理 | ログアウト時にトークン無効化、複数デバイス対応 |
