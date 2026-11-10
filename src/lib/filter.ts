import { displayName } from '../data'
import type { Decoration, Filters } from '../types'

/** 全角英数→半角、大文字→小文字に揃えて比較する（「ＵＰ」「up」「KO」「ko」などを同一視） */
export const normalize = (s: string) => s.normalize('NFKC').toLowerCase()

/** 装飾品名・スキル名のどちらかに部分一致すれば true。空白区切りは AND 検索 */
export function matchesSearch(d: Decoration, search: string): boolean {
  const terms = normalize(search).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const haystack = normalize([displayName(d), ...d.skills.map((s) => s.name)].join(' '))
  return terms.every((t) => haystack.includes(t))
}

export function filterDecorations(list: Decoration[], checked: Set<number>, f: Filters): Decoration[] {
  return list.filter((d) => {
    const isChecked = checked.has(d.id)
    if (f.ownership === 'checked' && !isChecked) return false
    if (f.ownership === 'unchecked' && isChecked) return false
    if (f.rarity !== 'all' && d.rarity !== f.rarity) return false
    if (f.type !== 'all' && d.type !== f.type) return false
    return matchesSearch(d, f.search)
  })
}
