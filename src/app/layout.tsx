import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/i18n/LanguageProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  icons: {
    icon: '/pivofavicon.png',
    apple: '/pivofavicon.png',
  },
  title: 'Pivolink — QRコード・NFCタグのリダイレクト管理',
  description: 'Pivolink（ピボリンク）は、QRコード・NFCタグのリダイレクト先をいつでも変更できる管理サービス。印刷済みQRや設置済みNFCの遷移先をワンクリックで切替。',
  metadataBase: new URL('https://redirect.tsuratsura.com'),
  openGraph: {
    title: 'Pivolink — QRコード・NFCタグのリダイレクト管理',
    description: 'QRコード・NFCタグのリダイレクト先をいつでも変更。印刷済みQRコードの再発行不要。無料プランあり。',
    url: 'https://redirect.tsuratsura.com',
    siteName: 'Pivolink',
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: '/ogp.png', width: 1200, height: 630, alt: 'Pivolink — QRの飛び先、いつでも変更。' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pivolink — QRコード・NFCタグのリダイレクト管理',
    description: 'QRコード・NFCタグのリダイレクト先をいつでも変更。印刷済みQRコードの再発行不要。',
    images: ['/ogp.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
