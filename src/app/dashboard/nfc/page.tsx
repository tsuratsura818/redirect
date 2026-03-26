'use client'

import { useState } from 'react'
import NFCReader from '@/components/mobile/NFCReader'
import NFCWriter from '@/components/mobile/NFCWriter'

type Tab = 'read' | 'write'

export default function NFCPage() {
  const [tab, setTab] = useState<Tab>('write')

  return (
    <div className="max-w-lg mx-auto py-6">
      {/* タブ切替 */}
      <div className="flex mx-4 mb-4 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab('write')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            tab === 'write'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          書き込み
        </button>
        <button
          onClick={() => setTab('read')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            tab === 'read'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          読み取り
        </button>
      </div>

      {tab === 'write' ? <NFCWriter /> : <NFCReader />}
    </div>
  )
}
