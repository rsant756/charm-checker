import type { Decoration, Skill } from '../types'
import raw from './decorations.json'

export const decorations = raw as Decoration[]

export const displayName = (d: Decoration) => `${d.name}【${d.slot}】`

export const skillLabel = (s: Skill) => `${s.name}Lv${s.level}`

export const TYPE_LABEL = { weapon: '武器用', armor: '防具用' } as const

/** 検索候補用のスキル名一覧（五十音順） */
export const skillNames = [...new Set(decorations.flatMap((d) => d.skills.map((s) => s.name)))].sort(
  (a, b) => a.localeCompare(b, 'ja'),
)
