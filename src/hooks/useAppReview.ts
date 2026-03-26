'use client'

import { useCallback, useRef } from 'react'
import { Capacitor } from '@capacitor/core'

const STORAGE_KEY = 'pivolink_review_state'
const MIN_SUCCESS_ACTIONS = 3
const MIN_DAYS_SINCE_INSTALL = 3
const COOLDOWN_DAYS = 90

interface ReviewState {
  successCount: number
  firstUseDate: string
  lastPromptDate: string | null
  prompted: boolean
}

function getState(): ReviewState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* */ }
  return {
    successCount: 0,
    firstUseDate: new Date().toISOString(),
    lastPromptDate: null,
    prompted: false,
  }
}

function saveState(state: ReviewState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* */ }
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

// ネイティブレビューダイアログを表示
async function requestNativeReview(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false

  try {
    const platform = Capacitor.getPlatform()
    if (platform === 'android') {
      // Google Play ストアページを開く
      window.open('market://details?id=com.tsuratsura.pivolink', '_system')
      return true
    }
    if (platform === 'ios') {
      // App Store ページを開く（IDは公開後に設定）
      window.open('https://apps.apple.com/app/idXXXXXXXXXX', '_system')
      return true
    }
    return false
  } catch {
    return false
  }
}

export function useAppReview() {
  const promptedRef = useRef(false)

  // 成功操作をカウントし、条件を満たしたらレビュー依頼
  const trackSuccess = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return
    if (promptedRef.current) return

    const state = getState()
    state.successCount++
    saveState(state)

    // 条件チェック
    const enoughActions = state.successCount >= MIN_SUCCESS_ACTIONS
    const enoughDays = daysSince(state.firstUseDate) >= MIN_DAYS_SINCE_INSTALL
    const notCoolingDown = !state.lastPromptDate || daysSince(state.lastPromptDate) >= COOLDOWN_DAYS

    if (enoughActions && enoughDays && notCoolingDown) {
      promptedRef.current = true
      const shown = await requestNativeReview()
      if (shown) {
        state.lastPromptDate = new Date().toISOString()
        state.prompted = true
        saveState(state)
      }
    }
  }, [])

  return { trackSuccess }
}
