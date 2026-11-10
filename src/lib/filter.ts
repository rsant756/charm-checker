import { displayName, neededCount } from '../data'
import { decorationUsableBy, type Weapon } from '../data/weapons'
import type { Decoration, Filters } from '../types'
import { countOf } from './stats'
import type { Owned } from './storage'

/** 全角英数→半角、大文字→小文字に揃えて比較する（「ＵＰ」「up」「KO」「ko」などを同一視） */
export const normalize = (s: string) => s.normalize('NFKC').toLowerCase()

/** 装飾品名・スキル名のどちらかに部分一致すれば true。空白区切りは AND 検索 */
export function matchesSearch(d: Decoration, search: string): boolean {
  const terms = normalize(search).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const haystack = normalize([displayName(d), ...d.skills.map((s) => s.name)].join(' '))
  return terms.every((t) => haystack.includes(t))
}

export function filterDecorations(list: Decoration[], owned: Owned, f: Filters): Decoration[] {
  return list.filter((d) => {
    const count = countOf(owned, d.id)
    if (f.ownership === 'checked' && count === 0) return false
    if (f.ownership === 'unchecked' && count > 0) return false
    if (f.ownership === 'incomplete' && count >= neededCount(d)) return false
    if (f.rarity !== 'all' && d.rarity !== f.rarity) return false
    if (f.type !== 'all' && d.type !== f.type) return false
    if (f.weapon !== 'all' && !decorationUsableBy(d, f.weapon as Weapon)) return false
    return matchesSearch(d, f.search)
  })
}
