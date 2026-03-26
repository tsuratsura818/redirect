'use client'

import { useState, useEffect } from 'react'
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
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchLinks = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('qr_codes')
        .select('id, slug, label, redirect_url')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

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
      setLoading(false)
    }
    fetchLinks()
  }, [])

  const filtered = links.filter(
    (l) =>
      l.label.toLowerCase().includes(search.toLowerCase()) ||
      l.slug.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
