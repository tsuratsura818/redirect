import type { Metadata } from 'next'
import LPLayout from '../LPLayout'

export const metadata: Metadata = {
  title: 'ECショップのQRコード活用 — Pivolink',
  description: '商品同梱QRでレビュー誘導とクーポン配布をA/Bテスト。パッケージのQRはサイト移行にも自動追従。ECのQR活用をPivolinkで最適化。',
}

export default function EcLP() {
  return (
    <LPLayout
      industry="EC・通販"
      tagline="ECショップのQRコード活用"
      headline={'同梱物のQRコード、\n使い捨てにしてませんか？'}
      subheadline="レビュー誘導・クーポン配布・SNSフォロー誘導。A/Bテストで効果を比較し、最適な施策をデータで選ぶ。パッケージの刷り直し不要。"
      heroColor="bg-gradient-to-br from-violet-500 to-purple-700"
      painTitle="ECショップのQRコード、こんな悩みありませんか？"
      painPoints={[
        '商品同梱のQRが古いキャンペーンページに飛ぶ',
        'ECサイトをリニューアルしたらパッケージのQRが全部リンク切れ',
        'レビュー誘導とクーポン配布、どちらが効果的か分からない',
        'パッケージ印刷後にURLが変わり、在庫分のパッケージにシール貼り',
        '季節キャンペーンのたびにパッケージを別バージョンで印刷',
        'SNSフォロー誘導のQR、プラットフォーム変更で無効化',
      ]}
      steps={[
        {
          icon: '📦',
          before: 'ECサイト移行 → 全在庫パッケージのQRがリンク切れ → シール貼り替え',
          after: '管理画面でURLを新サイトに変更 → 在庫パッケージのQRが自動追従',
        },
        {
          icon: '⭐',
          before: 'レビュー誘導QR → 何人がスキャンしたか不明',
          after: 'アクセス解析でスキャン数・時間帯・デバイスを可視化',
        },
        {
          icon: '🧪',
          before: '「レビュー」と「クーポン」どちらが効くか勘で判断',
          after: 'A/Bテストでトラフィック分割 → データで最適施策を選択',
        },
      ]}
      scenarios={[
        {
          icon: '⭐',
          title: '同梱QR → レビュー vs クーポンをA/Bテスト',
          desc: '商品に同梱するカードのQR。「レビュー投稿でポイント」と「次回10%OFFクーポン」を50:50でテスト。2週間後、コンバージョンが高い方に100%切替。',
        },
        {
          icon: '📦',
          title: 'パッケージQR → サイト移行に自動追従',
          desc: 'ECサイトのURL体系が変わっても、Pivolinkのリンク先を変更するだけ。在庫パッケージの印刷を変更する必要なし。',
        },
        {
          icon: '🎄',
          title: '季節キャンペーンQR → 自動切替',
          desc: '同梱カードのQRを1種類で統一。バレンタイン → ホワイトデー → 母の日 → 夏セールと、スケジュール設定で自動的にキャンペーンページを切替。',
        },
        {
          icon: '📱',
          title: 'アプリ誘導QR → iOS/Android振分',
          desc: 'デバイス別振分でiPhoneユーザーにはApp Store、AndroidユーザーにはGoogle Playへ。1つのQRで全デバイス対応。',
        },
        {
          icon: '🎫',
          title: 'クッションページで会員登録誘導',
          desc: 'QR読み取り → クッションページで「LINE友だち追加で送料無料！」→ そのまま商品ページへリダイレクト。リダイレクト前の1画面でCVを追加。',
        },
        {
          icon: '📊',
          title: 'チラシ × EC の効果測定',
          desc: '折込チラシにPivolinkのQRを掲載。何人がスキャンしたか、いつスキャンしたかをアクセス解析で確認。オフライン広告のROI測定に。',
        },
      ]}
      features={[
        { icon: '⚡', title: 'A/Bテスト', desc: 'レビュー誘導・クーポン・SNSフォロー…最適な施策をデータで選ぶ。重み付けも自由に設定。' },
        { icon: '🖥️', title: 'デバイス別振分', desc: 'iOS → App Store、Android → Play Store、PC → Webサイト。1つのQRで全対応。' },
        { icon: '⏰', title: 'スケジュール切替', desc: '季節キャンペーンを事前設定。日付指定で自動切替、手動作業ゼロ。' },
        { icon: '📊', title: 'アクセス解析', desc: 'スキャン数・デバイス・時間帯を可視化。オフライン施策の効果測定に直結。' },
        { icon: '🎫', title: 'クッションページ', desc: 'リダイレクト前に会員登録やLINE追加を誘導。CVポイントを1つ追加。' },
        { icon: '📅', title: '有効期限設定', desc: 'キャンペーン終了後は通常商品ページへ自動転送。リンク切れゼロ。' },
      ]}
      roi={[
        { label: 'パッケージ刷り直し', before: '年3回 × 10,000枚 × ¥15 = ¥450,000', after: '年1回 × 10,000枚 = ¥150,000', saving: '¥300,000削減' },
        { label: '同梱カード刷り直し', before: '年4回 × 5,000枚 × ¥8 = ¥160,000', after: '年1回 × 5,000枚 = ¥40,000', saving: '¥120,000削減' },
        { label: 'シール貼り替え人件費', before: '年2回 × 3,000個 × ¥20 = ¥120,000', after: '¥0', saving: '¥120,000削減' },
        { label: 'Pivolink費用', before: '—', after: 'Proプラン ¥780/月 = ¥9,360/年', saving: '—' },
      ]}
      roiSummary="年間約530,000円のコスト削減 + A/Bテストによる売上向上"
      ctaText="パッケージは1回印刷。施策はデータで最適化。"
    />
  )
}
