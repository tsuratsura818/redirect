import type { Metadata } from 'next'
import LPContent from './LPContent'

export const metadata: Metadata = {
  title: 'Pivolink — QRコード・NFCタグのリダイレクト管理SaaS',
  description: 'QRコード・NFCタグのリダイレクト先をいつでも変更できる管理サービス。印刷済みQRコードの再発行不要。スケジュール切替・デバイス別振分・A/Bテスト対応。無料プランあり。',
  alternates: { canonical: 'https://redirect.tsuratsura.com' },
}

export default function Home() {
  return <LPContent />
}
