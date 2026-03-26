import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

// QR画像をローカルに保存
export async function saveQRImage(
  base64Data: string,
  fileName: string
): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    // Web版: ダウンロードリンクで対応
    try {
      const link = document.createElement('a')
      link.href = `data:image/png;base64,${base64Data}`
      link.download = fileName
      link.click()
      return fileName
    } catch {
      return null
    }
  }

  try {
    const result = await Filesystem.writeFile({
      path: `pivolink/${fileName}`,
      data: base64Data,
      directory: Directory.Documents,
      recursive: true,
    })
    return result.uri
  } catch {
    return null
  }
}

// 保存したファイルのURIを取得
export async function getFileUri(fileName: string): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null

  try {
    const result = await Filesystem.getUri({
      path: `pivolink/${fileName}`,
      directory: Directory.Documents,
    })
    return result.uri
  } catch {
    return null
  }
}
