// 所持数の保存（localStorage 自動保存 + .mhws ファイル入出力）

/** 装飾品ID → 所持数（0 は保持しない） */
export type Owned = Map<number, number>

const STORAGE_KEY = 'charm-checker:owned:v2'
/** v2.0.0 公開時点（チェックのみ）のキー。読み込み時に引き継ぐ */
const LEGACY_STORAGE_KEY = 'charm-checker:checked:v1'
export const MHWS_VERSION = '2.0'
/** 1種類あたりの所持数の上限（入力ミス対策） */
export const MAX_COUNT = 99

export function loadFromStorage(): Owned {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    return raw ? parseMhws(raw) : new Map()
  } catch {
    return new Map()
  }
}

export function saveToStorage(owned: Owned): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeMhws(owned))
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // プライベートブラウズ等で保存できない場合は無視（.mhws 保存は引き続き使える）
  }
}

/**
 * {"version":"2.0","checkedItems":[...],"counts":{"id":個数}}
 * checkedItems は旧形式（1.0）との互換のために残している
 */
export function serializeMhws(owned: Owned): string {
  const ids = [...owned.keys()].sort((a, b) => a - b)
  return JSON.stringify({
    version: MHWS_VERSION,
    checkedItems: ids,
    counts: Object.fromEntries(ids.map((id) => [id, owned.get(id)])),
  })
}

const clampCount = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(MAX_COUNT, Math.max(0, Math.floor(v))) : 0

/**
 * .mhws の中身を検証して所持数を返す。不正な形式なら例外を投げる。
 * 旧形式（1.0: checkedItems のみ）はチェック済み＝1個所持として読む
 */
export function parseMhws(text: string): Owned {
  const data: unknown = JSON.parse(text)
  if (typeof data !== 'object' || data === null) throw new Error('形式が不正です')
  const { checkedItems, counts } = data as { checkedItems?: unknown; counts?: unknown }

  const owned: Owned = new Map()
  if (typeof counts === 'object' && counts !== null && !Array.isArray(counts)) {
    for (const [key, value] of Object.entries(counts)) {
      const id = Number(key)
      const n = clampCount(value)
      if (Number.isInteger(id) && n > 0) owned.set(id, n)
    }
    return owned
  }
  if (!Array.isArray(checkedItems)) throw new Error('checkedItems がありません')
  for (const id of checkedItems) if (Number.isInteger(id)) owned.set(id as number, 1)
  return owned
}
