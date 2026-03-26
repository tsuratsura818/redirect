import type { Metadata } from 'next'
import LPLayout from '../LPLayout'

export const metadata: Metadata = {
  title: '飲食店のQRコード活用 — Pivolink',
  description: 'テーブルQRを毎回貼り替えていませんか？Pivolinkなら季節メニュー・クーポン・レビュー誘導をQRコードの貼り替えなしで自動切替。飲食店のQR活用を最適化。',
}

export default function RestaurantLP() {
  return (
    <LPLayout
      industry="飲食店"
      tagline="飲食店のQRコード活用"
      headline={'テーブルのQRコード、\n毎回貼り替えてませんか？'}
      subheadline="季節メニュー・クーポン・レビュー誘導。Pivolinkなら一度貼れば、リンク先だけ管理画面で変更。貼り替え作業ゼロ。"
      heroColor="bg-gradient-to-br from-orange-500 to-red-600"
      painTitle="飲食店のQRコード、こんな悩みありませんか？"
      painPoints={[
        '季節メニューが変わるたびにテーブルのQRシールを全席貼り替え',
        'キャンペーン終了後のQRがリンク切れのまま放置',
        'テイクアウト袋のQRが古いメニューに飛ぶ',
        'レジ横のQR、クーポンとレビュー誘導どっちが効くか分からない',
        '多店舗展開で全店のQRを一斉に変更するのが大変',
        'Googleマップの口コミ誘導QRを貼ったが効果が測れない',
      ]}
      steps={[
        {
          icon: '🍽️',
          before: '季節メニュー更新 → 全席のQRシール貼り替え（2時間）',
          after: '管理画面でURL変更（10秒）→ 全席のQRが新メニューへ',
        },
        {
          icon: '🎫',
          before: 'クーポン終了 → QRが「ページが見つかりません」に',
          after: 'スケジュール設定で自動切替 → 次のクーポンへシームレスに遷移',
        },
        {
          icon: '⭐',
          before: 'レビュー誘導とクーポン配布、どっちが効くか分からない',
          after: 'A/Bテスト機能で50:50に分割 → データで効果比較',
        },
      ]}
      scenarios={[
        {
          icon: '📋',
          title: 'テーブルQR → 季節メニュー自動切替',
          desc: '春メニュー → 夏メニュー → 秋メニュー → 冬メニューをスケジュール設定。日付指定で自動的にリンク先が切り替わります。貼り替え作業ゼロ。',
        },
        {
          icon: '🎁',
          title: 'レジ横NFC → 今月のクーポン',
          desc: 'レジ横にNFCタグを1つ設置。毎月のクーポンページを管理画面で更新するだけ。お客さんはタッチするだけでその月のクーポンを取得。',
        },
        {
          icon: '⭐',
          title: '会計後QR → レビュー誘導 vs クーポン',
          desc: 'レシートや卓上POPのQRでA/Bテスト。「Googleレビュー誘導」と「次回10%OFFクーポン」、どちらがリピートに繋がるかデータで検証。',
        },
        {
          icon: '🥡',
          title: 'テイクアウト袋QR → 注文フォーム',
          desc: 'テイクアウト袋に印刷したQR。最初はメニュー表、次はUber Eats、年末はおせち予約ページへ。袋の印刷は1回だけ。',
        },
        {
          icon: '🏪',
          title: '多店舗一括管理',
          desc: '全店舗に同じスラッグのQRを設置。本部が管理画面でURL変更すると全店一斉にリンク先が更新。店舗ごとの作業ゼロ。',
        },
        {
          icon: '🌏',
          title: 'インバウンド対応',
          desc: 'デバイス別振分でiOSユーザーには英語メニュー、Androidユーザーには中国語メニューへ自動転送。外国人観光客にも対応。',
        },
      ]}
      features={[
        { icon: '⏰', title: 'スケジュール切替', desc: '季節メニューの切替日時を事前に設定。自動で切り替わるから「忘れてた！」がゼロに。' },
        { icon: '🔲', title: 'QRコード自動生成', desc: 'リンク発行と同時にPNG/SVGでQR生成。そのまま印刷所に入稿可能。' },
        { icon: '📊', title: 'アクセス解析', desc: '何回スキャンされたか、いつ、どのデバイスからか一目瞭然。チラシやPOPの効果測定に。' },
        { icon: '⚡', title: 'A/Bテスト', desc: 'クーポンとレビュー誘導を50:50で分割。どちらの施策が効果的かデータで判断。' },
        { icon: '🖥️', title: 'デバイス別振分', desc: 'iPhone/Android/PCで異なるページへ。アプリ誘導やインバウンド対応に。' },
        { icon: '🎫', title: 'クッションページ', desc: 'QR読み取り後に「LINEお友達追加で10%OFF！」等のメッセージを表示してからリダイレクト。' },
      ]}
      roi={[
        { label: 'QRシール貼り替え', before: '年4回 × 30席 = 120枚', after: '0枚', saving: '作業時間 8h → 0h' },
        { label: 'QRシール印刷費', before: '120枚 × ¥50 = ¥6,000/年', after: '初回30枚のみ ¥1,500', saving: '¥4,500削減' },
        { label: 'チラシ刷り直し', before: '年3回 × 3,000枚 = ¥90,000', after: '年1回 × 3,000枚 = ¥30,000', saving: '¥60,000削減' },
        { label: 'Pivolink費用', before: '—', after: 'Proプラン ¥780/月 = ¥9,360/年', saving: '—' },
      ]}
      roiSummary="年間約55,000円のコスト削減 + 作業時間8時間の節約"
      ctaText="テーブルのQRコード、もう貼り替えなくていい。"
    />
  )
}
