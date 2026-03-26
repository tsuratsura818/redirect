import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    return null
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
}

// プッシュ通知を送信
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: number; failure: number }> {
  const app = getFirebaseAdmin()
  if (!app) {
    console.warn('Firebase Admin not configured')
    return { success: 0, failure: 0 }
  }

  const messaging = getMessaging(app)
  const message = {
    notification: { title, body },
    data: data ?? {},
    tokens,
  }

  try {
    const response = await messaging.sendEachForMulticast(message)
    return {
      success: response.successCount,
      failure: response.failureCount,
    }
  } catch (err) {
    console.error('[FCM] sendEachForMulticast failed:', err instanceof Error ? err.message : err)
    return { success: 0, failure: tokens.length }
  }
}

// 特定ユーザーに通知送信
export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  // Supabase server clientをインポート
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()

  const { data: tokens } = await supabase
    .from('device_tokens')
    .select('token')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!tokens || tokens.length === 0) return { success: 0, failure: 0 }

  return sendPushNotification(
    tokens.map((t) => t.token),
    title,
    body,
    data
  )
}
