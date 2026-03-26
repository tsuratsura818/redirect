'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePlatform } from '@/hooks/usePlatform'
import { usePushNotifications } from '@/hooks/usePushNotifications'

interface NotificationPrefs {
  access_spike_alert: boolean
  url_down_alert: boolean
  monthly_report: boolean
}

export default function SettingsPage() {
  const { isNative, platform } = usePlatform()
  const { isSupported: pushSupported, isRegistered, register } = usePushNotifications()
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    access_spike_alert: true,
    url_down_alert: true,
    monthly_report: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/notification-preferences')
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setPrefs({
            access_spike_alert: data.access_spike_alert ?? true,
            url_down_alert: data.url_down_alert ?? true,
            monthly_report: data.monthly_report ?? true,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const updatePref = useCallback(
    async (key: keyof NotificationPrefs, value: boolean) => {
      setPrefs((prev) => ({ ...prev, [key]: value }))
      setSaving(true)
      try {
        await fetch('/api/notification-preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: value }),
        })
      } finally {
        setSaving(false)
      }
    },
    []
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const notificationItems = [
    {
      key: 'access_spike_alert' as const,
      label: 'アクセス急増アラート',
      desc: 'QRコード/NFCタグへのアクセスが急増した時に通知',
    },
    {
      key: 'url_down_alert' as const,
      label: 'リダイレクト先ダウン通知',
      desc: '設定したURLが応答しなくなった時に通知',
    },
    {
      key: 'monthly_report' as const,
      label: '月次レポート',
      desc: '月間のアクセス集計レポートを配信',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">設定</h1>

      {/* プッシュ通知セクション */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-1">プッシュ通知</h2>
        <p className="text-sm text-gray-500 mb-4">
          {isNative
            ? 'アプリに直接プッシュ通知を送ります'
            : 'プッシュ通知はモバイルアプリでのみ利用可能です'}
        </p>

        {isNative && pushSupported && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {isRegistered ? '通知は有効です' : '通知を有効にする'}
              </p>
              <p className="text-xs text-gray-500">
                {platform === 'ios' ? 'Apple Push' : 'Firebase Cloud Messaging'}
              </p>
            </div>
            {!isRegistered && (
              <button
                onClick={register}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                有効にする
              </button>
            )}
            {isRegistered && (
              <span className="text-green-600 text-sm font-medium">有効</span>
            )}
          </div>
        )}

        {!isNative && (
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            Pivolinkアプリをインストールするとプッシュ通知が利用できます
          </div>
        )}
      </section>

      {/* 通知設定セクション */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">通知の種類</h2>

        <div className="space-y-4">
          {notificationItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => updatePref(item.key, !prefs[item.key])}
                disabled={saving}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  prefs[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    prefs[item.key] ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* デバイス情報 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">デバイス情報</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">プラットフォーム</span>
            <span className="font-medium">
              {platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'Web'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ネイティブアプリ</span>
            <span className="font-medium">{isNative ? 'はい' : 'いいえ'}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
