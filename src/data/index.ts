import type { Decoration, Skill } from '../types'
import raw from './decorations.json'
import skillMaxRaw from './skills.json'

export const decorations = raw as Decoration[]

/** スキル名 → 最大Lv */
export const skillMax: Record<string, number> = skillMaxRaw

export const displayName = (d: Decoration) => `${d.name}【${d.slot}】`

export const skillLabel = (s: Skill) => `${s.name}Lv${s.level}`

export const TYPE_LABEL = { weapon: '武器用', armor: '防具用' } as const

/**
 * 1つの装備セットで無駄なく使える最大個数（＝必要数）。
 * どのスキルも最大Lvを超えない個数。例: 最大Lv5のスキルのLv2珠 → 3個、
 * 業物Lv3+匠Lv1（業物の最大Lv3）→ 1個（2個目以降は業物があふれる）
 */
export function neededCount(d: Decoration): number {
  return Math.min(...d.skills.map((s) => Math.ceil((skillMax[s.name] ?? s.level) / s.level)))
}

/** 検索候補用のスキル名一覧（五十音順） */
export const skillNames = [...new Set(decorations.flatMap((d) => d.skills.map((s) => s.name)))].sort(
  (a, b) => a.localeCompare(b, 'ja'),
)
