import { neededCount } from '../data'
import type { Decoration } from '../types'
import type { Owned } from './storage'

export type Stat = { owned: number; total: number; percent: number }

export const toStat = (owned: number, total: number): Stat => ({
  owned,
  total,
  percent: total > 0 ? (owned / total) * 100 : 0,
})

export const formatPercent = (p: number) => p.toFixed(1)

export const countOf = (owned: Owned, id: number) => owned.get(id) ?? 0

/** 入手率: 1個以上持っている種類の割合 */
export function overallStat(list: Decoration[], owned: Owned): Stat {
  return toStat(list.filter((d) => countOf(owned, d.id) > 0).length, list.length)
}

/** コンプ率: 必要数に対する所持数の割合（必要数を超えた分は数えない） */
export function completionStat(list: Decoration[], owned: Owned): Stat {
  let have = 0
  let need = 0
  for (const d of list) {
    const n = neededCount(d)
    need += n
    have += Math.min(countOf(owned, d.id), n)
  }
  return toStat(have, need)
}

export function rarityStats(list: Decoration[], owned: Owned) {
  const rarities = [...new Set(list.map((d) => d.rarity))].sort((a, b) => a - b)
  return rarities.map((rarity) => ({
    rarity,
    ...overallStat(
      list.filter((d) => d.rarity === rarity),
      owned,
    ),
  }))
}

export function shareUrl(percent: number, siteUrl: string) {
  const text = `私の装飾品取得率は${formatPercent(percent)}%！\n${siteUrl}\n#ワイルズ装飾品チェッカー`
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`
}
