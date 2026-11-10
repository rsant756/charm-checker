const SEEN_KEY = 'charm-checker:tour-seen:v1'

export function hasSeenTour(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return true // 保存できない環境では毎回出さない
  }
}

export function markTourSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // 無視
  }
}
