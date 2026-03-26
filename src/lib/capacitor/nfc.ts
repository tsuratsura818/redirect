import { Capacitor } from '@capacitor/core'
import { CapacitorNfc } from '@capgo/capacitor-nfc'
import type { NfcTag, NdefRecord } from '@capgo/capacitor-nfc'

// 統一型
export interface NFCTag {
  id: string
  records: Array<{ payload: string }>
}

// byte配列からURLを復元（NDEF URIレコード）
export function decodeNdefUriPayload(payload: number[]): string {
  if (payload.length < 2) return ''
  // URI prefix map (NFC Forum URI Record Type Definition)
  const prefixes: Record<number, string> = {
    0x00: '',
    0x01: 'http://www.',
    0x02: 'https://www.',
    0x03: 'http://',
    0x04: 'https://',
  }
  const prefixByte = payload[0]
  const prefix = prefixes[prefixByte] ?? ''
  const rest = String.fromCharCode(...payload.slice(1))
  return prefix + rest
}

// URLをNDEF URIレコード用のbyte配列に変換
export function encodeNdefUriPayload(url: string): number[] {
  const prefixes: Array<[string, number]> = [
    ['https://www.', 0x02],
    ['http://www.', 0x01],
    ['https://', 0x04],
    ['http://', 0x03],
  ]
  for (const [prefix, code] of prefixes) {
    if (url.startsWith(prefix)) {
      const rest = url.slice(prefix.length)
      return [code, ...Array.from(rest).map((c) => c.charCodeAt(0))]
    }
  }
  return [0x00, ...Array.from(url).map((c) => c.charCodeAt(0))]
}

function toNFCTag(raw: NfcTag): NFCTag {
  const id = raw.id ? raw.id.map((b) => b.toString(16).padStart(2, '0')).join(':') : ''
  const records = (raw.ndefMessage ?? []).map((r) => ({
    payload: decodeNdefUriPayload(r.payload),
  }))
  return { id, records }
}

export async function isNFCSupported(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const { supported } = await CapacitorNfc.isSupported()
    return supported
  } catch {
    return false
  }
}

export async function startNFCScan(
  onTagDetected: (tag: NFCTag) => void
): Promise<(() => void) | null> {
  if (!Capacitor.isNativePlatform()) return null

  try {
    const listener = await CapacitorNfc.addListener('ndefDiscovered', (event) => {
      onTagDetected(toNFCTag(event.tag))
    })
    await CapacitorNfc.startScanning()

    return () => {
      listener.remove()
      CapacitorNfc.stopScanning().catch(() => {})
    }
  } catch {
    return null
  }
}

export async function writeNFCTag(url: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false

  try {
    const payload = encodeNdefUriPayload(url)
    const record: NdefRecord = {
      tnf: 1, // TNF_WELL_KNOWN
      type: [0x55], // 'U' = URI
      id: [],
      payload,
    }
    await CapacitorNfc.write({ records: [record] })
    return true
  } catch {
    return false
  }
}

// PivolinkのリダイレクトURLパターンかチェック
export function isPivolinkURL(url: string): string | null {
  const patterns = [
    /https?:\/\/redirect\.tsuratsura\.com\/r\/([a-zA-Z0-9_-]+)/,
    /https?:\/\/pivolink\.com\/r\/([a-zA-Z0-9_-]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
