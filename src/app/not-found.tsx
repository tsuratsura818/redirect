import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-foreground mb-2">ページが見つかりません</p>
        <p className="text-muted mb-8">指定されたリダイレクトURLは存在しないか、削除されています。</p>
        <Link href="/" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
          トップページへ
        </Link>
      </div>
    </div>
  )
}
