import type { Metadata } from 'next'
import LPContent from './LPContent'
import AuthHashHandler from '@/components/AuthHashHandler'
import { SITE_URL } from '@/lib/site'
import translations from '@/i18n/translations'

export const metadata: Metadata = {
  title: 'Pivolink — QRコード・NFCタグのリダイレクト管理SaaS',
  description: 'QRコード・NFCタグのリダイレクト先をいつでも変更できる管理サービス。印刷済みQRコードの再発行不要。スケジュール切替・デバイス別振分・A/Bテスト対応。無料プランあり。',
  alternates: { canonical: SITE_URL },
}

/**
 * 構造化データ。検索結果のリッチリザルトだけでなく、AI検索が
 * 「Pivolinkが何なのか」を機械可読で拾えるようにするためのもの。
 * FAQ は LP に実際に表示されている内容と同じ配列を使う（不一致は違反になる）。
 */
function structuredData() {
  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Pivolink',
    alternateName: 'ピボリンク',
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'QRコード・NFCタグのリンク先を、印刷・設置後でも管理画面からいつでも変更できるSaaS。スケジュール切替・デバイス別振分・A/Bテストに対応。',
    inLanguage: 'ja',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
      description: 'Freeプラン: 3件・月間1,000アクセスまで無料。クレジットカード登録不要。',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TSURATSURA',
      url: 'https://tsuratsura.com',
    },
  }

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: translations.ja.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pivolink',
    url: SITE_URL,
    inLanguage: 'ja',
  }

  return [software, faq, website]
}

export default function Home() {
  return (
    <>
      {structuredData().map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <AuthHashHandler />
      <LPContent />
    </>
  )
}
