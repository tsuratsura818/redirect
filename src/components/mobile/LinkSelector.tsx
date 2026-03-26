'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Link {
  id: string
  slug: string
  label: string
  redirectUrl: string
}

interface LinkSelectorProps {
  onSelect: (link: Link) => void
}

export default function LinkSelector({ onSelect }: LinkSelectorProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setFetchError(true); setLoading(false); return }

        const { data, error } = await supabase
          .from('qr_codes')
          .select('id, slug, label, redirect_url')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) { setFetchError(true); setLoading(false); return }

        if (data) {
          setLinks(
            data.map((d) => ({
              id: d.id,
              slug: d.slug,
              label: d.label || d.slug,
              redirectUrl: d.redirect_url,
            }))
          )
        }
      } catch {
        setFetchError(true)
      }
      setLoading(false)
    }
    fetchLinks()
  }, [])

  const filtered = useMemo(
    () => {
      const q = search.toLowerCase()
      return links.filter(
        (l) => l.label.toLowerCase().includes(q) || l.slug.toLowerCase().includes(q)
      )
    },
    [links, search]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">リンクを読み込み中...</span>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-600">リンクの取得に失敗しました</p>
        <button
          onClick={() => { setFetchError(false); setLoading(true); location.reload() }}
          className="mt-2 text-xs text-blue-600 underline"
        >
          再読み込み
        </button>
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">リンクがありません</p>
        <p className="text-xs text-gray-400 mt-1">
          先にWeb管理画面でQRコード/リンクを作成してください
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="リンクを検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="max-h-80 overflow-y-auto space-y-2">
        {filtered.map((link) => (
          <button
            key={link.id}
            onClick={() => onSelect(link)}
            className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
          >
            <p className="text-sm font-medium text-gray-900">{link.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">/{link.slug}</p>
            <p className="text-xs text-gray-400 mt-1 truncate">{link.redirectUrl}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && search && (
        <p className="text-center text-sm text-gray-400 py-4">
          「{search}」に一致するリンクがありません
        </p>
      )}
    </div>
  )
}
