# QR Redirect Manager

## 概要
QRコードのリダイレクト先を動的に管理するSaaSサービス。
印刷済みQRコードの遷移先を後から変更可能にする。

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
- `/dashboard/qr` — QRコード一覧
- `/dashboard/qr/new` — 新規作成
- `/dashboard/qr/[id]` — QR詳細（概要/ルール/アナリティクス/クッション/履歴）
- `/r/[slug]` — リダイレクトエンドポイント（QRコードが指すURL）
- `/r/[slug]/cushion` — クッションページ

## DB
- Supabase PostgreSQL
- マイグレーション: `supabase/migration.sql`
