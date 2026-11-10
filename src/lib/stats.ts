import type { Decoration } from '../types'

export type Stat = { owned: number; total: number; percent: number }

export const toStat = (owned: number, total: number): Stat => ({
  owned,
  total,
  percent: total > 0 ? (owned / total) * 100 : 0,
})

export const formatPercent = (p: number) => p.toFixed(1)

export function overallStat(list: Decoration[], checked: Set<number>): Stat {
  return toStat(list.filter((d) => checked.has(d.id)).length, list.length)
}

export function rarityStats(list: Decoration[], checked: Set<number>) {
  const rarities = [...new Set(list.map((d) => d.rarity))].sort((a, b) => a - b)
  return rarities.map((rarity) => ({
    rarity,
    ...overallStat(
      list.filter((d) => d.rarity === rarity),
      checked,
    ),
  }))
}

export function shareUrl(percent: number, siteUrl: string) {
  const text = `私の装飾品取得率は${formatPercent(percent)}%！\n${siteUrl}\n#ワイルズ装飾品チェッカー`
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`
}
