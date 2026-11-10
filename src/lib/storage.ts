// チェック状態の保存（localStorage 自動保存 + .mhws ファイル入出力）

const STORAGE_KEY = 'charm-checker:checked:v1'
export const MHWS_VERSION = '1.0'

export function loadFromStorage(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(parseMhws(raw))
  } catch {
    return new Set()
  }
}

export function saveToStorage(ids: Set<number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeMhws(ids))
  } catch {
    // プライベートブラウズ等で保存できない場合は無視（.mhws 保存は引き続き使える）
  }
}

/** 旧アプリと同じ形式: {"version":"1.0","checkedItems":[...]} */
export function serializeMhws(ids: Set<number>): string {
  return JSON.stringify({
    version: MHWS_VERSION,
    checkedItems: [...ids].sort((a, b) => a - b),
  })
}

/** .mhws の中身を検証して ID 配列を返す。不正な形式なら例外を投げる */
export function parseMhws(text: string): number[] {
  const data: unknown = JSON.parse(text)
  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as { checkedItems?: unknown }).checkedItems)
  ) {
    throw new Error('checkedItems がありません')
  }
  return (data as { checkedItems: unknown[] }).checkedItems.filter(
    (v): v is number => Number.isInteger(v),
  )
}
