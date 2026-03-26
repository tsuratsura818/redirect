import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import type { Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications'

export async function isPushSupported(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const result = await PushNotifications.checkPermissions()
    return result.receive !== 'denied'
  } catch {
    return false
  }
}

export async function registerPush(callbacks: {
  onRegistration?: (token: Token) => void
  onRegistrationError?: (error: unknown) => void
  onNotification?: (notification: PushNotificationSchema) => void
  onNotificationAction?: (action: ActionPerformed) => void
}): Promise<(() => void) | null> {
  if (!Capacitor.isNativePlatform()) return null

  try {
    const permission = await PushNotifications.requestPermissions()
    if (permission.receive !== 'granted') return null

    const listeners: Array<{ remove: () => void }> = []

    if (callbacks.onRegistration) {
      listeners.push(
        await PushNotifications.addListener('registration', callbacks.onRegistration)
      )
    }
    if (callbacks.onRegistrationError) {
      listeners.push(
        await PushNotifications.addListener('registrationError', (err) => {
          callbacks.onRegistrationError?.(err)
        })
      )
    }
    if (callbacks.onNotification) {
      listeners.push(
        await PushNotifications.addListener('pushNotificationReceived', callbacks.onNotification)
      )
    }
    if (callbacks.onNotificationAction) {
      listeners.push(
        await PushNotifications.addListener('pushNotificationActionPerformed', callbacks.onNotificationAction)
      )
    }

    await PushNotifications.register()

    return () => {
      listeners.forEach((l) => l.remove())
    }
  } catch {
    return null
  }
}
