'use client'

import { useState } from 'react'
import type { DragEvent, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import type { QrCode } from '@/types/database'

export default function QrListClient({ initialCodes }: { initialCodes: QrCode[] }) {
  const router = useRouter()
  const [items, setItems] = useState<QrCode[]>(initialCodes)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const handleDragStart = (i: number) => setDragIndex(i)

  const handleDragOver = (e: DragEvent, i: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(i, 0, moved)
      return next
    })
    setDragIndex(i)
  }

  const handleDragEnd = async () => {
    if (dragIndex === null) return
    setDragIndex(null)
    // 並び順を保存
    try {
      const res = await fetch('/api/qr/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: items.map(c => c.id) }),
      })
      if (!res.ok) throw new Error()
    } catch {
      alert('並び順の保存に失敗しました。ページを再読み込みしてください。')
    }
  }

  const handleDelete = async (e: MouseEvent, code: QrCode) => {
    e.stopPropagation()
    if (busy) return
    if (!confirm(`「${code.name}」を削除しますか？\nこのQR / NFCのルール・アナリティクス・履歴もすべて削除され、元に戻せません。`)) {
      return
    }
    setBusy(true)
    const res = await fetch(`/api/qr/${code.id}`, { method: 'DELETE' })
    setBusy(false)
    if (res.ok) {
      setItems(prev => prev.filter(c => c.id !== code.id))
    } else {
      alert('削除に失敗しました')
    }
  }

  return (
    <div>
      <p className="text-muted text-sm mb-4">{items.length} 件 ・ 行をドラッグで並べ替えできます</p>
      <div className="grid gap-4">
        {items.map((code, i) => (
          <div
            key={code.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={e => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            onClick={() => router.push(`/dashboard/qr/${code.id}`)}
            className={`bg-card rounded-xl border border-border p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer ${
              dragIndex === i ? 'opacity-40' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="text-muted shrink-0 cursor-grab" title="ドラッグで並べ替え">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9h16M4 15h16" />
                  </svg>
                </span>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${
                    code.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {code.is_active ? 'アクティブ' : '停止中'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground truncate">{code.name}</h3>
                  <p className="text-sm text-muted mt-0.5 truncate">
                    /r/{code.slug}
                    {code.description && ` — ${code.description}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-sm shrink-0 pl-8 sm:pl-0">
                <div className="text-right">
                  <div className="font-bold text-foreground">{code.scan_count.toLocaleString()}</div>
                  <div className="text-muted text-xs sm:text-sm">アクセス</div>
                </div>
                <div className="text-right text-muted hidden sm:block">
                  {format(new Date(code.created_at), 'yyyy/MM/dd')}
                </div>
                <button
                  onClick={e => handleDelete(e, code)}
                  disabled={busy}
                  title="削除"
                  className="p-2 text-muted hover:text-danger transition-colors shrink-0 disabled:opacity-40"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
