# Redirect Manager (QR / NFC)

## 概要
QRコード・NFCタグのリダイレクト先を動的に管理するSaaSサービス。
印刷済みQRコードや設置済みNFCタグの遷移先を後から変更可能にする。

## 技術スタック
- Next.js 16 + TypeScript + Tailwind v4 + pnpm
- Supabase (PostgreSQL + Auth)
- Vercel デプロイ
- QRコード生成: qrcode
- グラフ: recharts
- UA解析: ua-parser-js

## 開発コマンド
```bash
pnpm dev          # 開発サーバー
pnpm build        # ビルド
pnpm lint         # ESLint
```

## URL構造
- `/` — ランディングページ
- `/login` — ログイン/新規登録
- `/dashboard` — ダッシュボード
- `/dashboard/qr` — QR / NFC 一覧
- `/dashboard/qr/new` — 新規作成
- `/dashboard/qr/[id]` — 詳細（概要/ルール/アナリティクス/クッション/履歴）
- `/dashboard/admin` — 管理者パネル（ユーザー管理・統計）
- `/r/[slug]` — リダイレクトエンドポイント（QR/NFCが指すURL）
- `/r/[slug]/cushion` — クッションページ

## DB
- Supabase PostgreSQL
- マイグレーション: `supabase/migration.sql` + `supabase/admin-migration.sql`

## 管理者機能
- `/api/admin/setup` — 初回セットアップ（最初のユーザーをadminに）
- `/api/admin/users` — ユーザー一覧
- `/api/admin/users/[id]` — ユーザー管理（ロール変更/BAN/削除）
- `/api/admin/stats` — サービス全体統計
