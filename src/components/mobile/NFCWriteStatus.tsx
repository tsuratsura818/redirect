'use client'

interface NFCWriteStatusProps {
  success: boolean
  linkLabel: string
  slug: string
  onReset: () => void
}

export default function NFCWriteStatus({
  success,
  linkLabel,
  slug,
  onReset,
}: NFCWriteStatusProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {success ? (
        <>
          <div className="w-24 h-24 text-green-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-green-700">書き込み完了!</h3>
          <div className="w-full p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm font-medium text-green-800">{linkLabel}</p>
            <p className="text-xs text-green-600 mt-1">
              NFCタグに pivolink.com/r/{slug} を書き込みました
            </p>
            <p className="text-xs text-gray-500 mt-2">
              このタグをスマートフォンでかざすと、設定したURLにリダイレクトされます。
              リダイレクト先はいつでもWeb管理画面から変更できます。
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="w-24 h-24 text-red-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-red-700">書き込み失敗</h3>
          <p className="text-sm text-gray-600 text-center">
            NFCタグへの書き込みに失敗しました。<br />
            タグの容量不足や書き込みロックが原因の可能性があります。
          </p>
        </>
      )}

      <button
        onClick={onReset}
        className="w-full max-w-sm py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        {success ? '別のタグに書き込む' : 'リトライ'}
      </button>
    </div>
  )
}
