import { describe, it, expect } from 'vitest'
import { isPivolinkURL, decodeNdefUriPayload, encodeNdefUriPayload } from '../nfc'

describe('isPivolinkURL', () => {
  it('redirect.tsuratsura.com のURLからslugを抽出する', () => {
    expect(isPivolinkURL('https://redirect.tsuratsura.com/r/abc123')).toBe('abc123')
    expect(isPivolinkURL('http://redirect.tsuratsura.com/r/my-slug_01')).toBe('my-slug_01')
  })

  it('pivolink.com のURLからslugを抽出する', () => {
    expect(isPivolinkURL('https://pivolink.com/r/test')).toBe('test')
    expect(isPivolinkURL('http://pivolink.com/r/a-b_c')).toBe('a-b_c')
  })

  it('Pivolink以外のURLはnullを返す', () => {
    expect(isPivolinkURL('https://example.com')).toBeNull()
    expect(isPivolinkURL('https://google.com/r/abc')).toBeNull()
    expect(isPivolinkURL('')).toBeNull()
    expect(isPivolinkURL('not a url')).toBeNull()
  })

  it('/r/ パスがないURLはnullを返す', () => {
    expect(isPivolinkURL('https://redirect.tsuratsura.com/')).toBeNull()
    expect(isPivolinkURL('https://redirect.tsuratsura.com/dashboard')).toBeNull()
  })

  it('slug部分が空のURLはnullを返す', () => {
    expect(isPivolinkURL('https://redirect.tsuratsura.com/r/')).toBeNull()
  })

  it('スペース入りURLはスペース前のslugを抽出する', () => {
    // 正規表現は [a-zA-Z0-9_-]+ なのでスペース前で止まる
    expect(isPivolinkURL('https://redirect.tsuratsura.com/r/abc 123')).toBe('abc')
  })
})

describe('decodeNdefUriPayload', () => {
  it('https:// プレフィックス(0x04)をデコードする', () => {
    const payload = [0x04, ...'redirect.tsuratsura.com/r/test'.split('').map(c => c.charCodeAt(0))]
    expect(decodeNdefUriPayload(payload)).toBe('https://redirect.tsuratsura.com/r/test')
  })

  it('https://www. プレフィックス(0x02)をデコードする', () => {
    const payload = [0x02, ...'example.com'.split('').map(c => c.charCodeAt(0))]
    expect(decodeNdefUriPayload(payload)).toBe('https://www.example.com')
  })

  it('http:// プレフィックス(0x03)をデコードする', () => {
    const payload = [0x03, ...'example.com'.split('').map(c => c.charCodeAt(0))]
    expect(decodeNdefUriPayload(payload)).toBe('http://example.com')
  })

  it('プレフィックスなし(0x00)をデコードする', () => {
    const payload = [0x00, ...'tel:+81123456789'.split('').map(c => c.charCodeAt(0))]
    expect(decodeNdefUriPayload(payload)).toBe('tel:+81123456789')
  })

  it('空配列は空文字を返す', () => {
    expect(decodeNdefUriPayload([])).toBe('')
    expect(decodeNdefUriPayload([0x04])).toBe('')
  })
})

describe('encodeNdefUriPayload', () => {
  it('https:// URLをエンコードする', () => {
    const encoded = encodeNdefUriPayload('https://redirect.tsuratsura.com/r/test')
    expect(encoded[0]).toBe(0x04)
    const rest = String.fromCharCode(...encoded.slice(1))
    expect(rest).toBe('redirect.tsuratsura.com/r/test')
  })

  it('https://www. URLをエンコードする', () => {
    const encoded = encodeNdefUriPayload('https://www.example.com')
    expect(encoded[0]).toBe(0x02)
    const rest = String.fromCharCode(...encoded.slice(1))
    expect(rest).toBe('example.com')
  })

  it('http:// URLをエンコードする', () => {
    const encoded = encodeNdefUriPayload('http://example.com')
    expect(encoded[0]).toBe(0x03)
  })

  it('プレフィックスに該当しないURLは0x00', () => {
    const encoded = encodeNdefUriPayload('ftp://files.example.com')
    expect(encoded[0]).toBe(0x00)
  })

  it('encode→decodeのラウンドトリップが一致する', () => {
    const urls = [
      'https://redirect.tsuratsura.com/r/abc123',
      'https://www.example.com/path',
      'http://localhost:3000',
      'http://www.test.com/foo',
    ]
    for (const url of urls) {
      expect(decodeNdefUriPayload(encodeNdefUriPayload(url))).toBe(url)
    }
  })
})
