import { decorations, displayName, skillMax } from '../data'
import { IMPORTANCE, IMPORTANCE_LABEL, importanceOf, type ImportanceLevel } from '../data/talismanWeights'
import { WEAPONS, skillAppliesTo, type Weapon } from '../data/weapons'
import type { Decoration, DecorationType } from '../types'

/**
 * 護石の評価（装飾品換算スコア）
 *
 * 1. 装飾品換算: 護石のスキルを装飾品で付けるなら、どのスロットがいくつ必要かを数える（スロットLvの合計）
 * 2. 武器スロは防具スロより貴重なので 2 倍で数える（武器のスロットは最大3つしかないため）
 * 3. その武器での重要度（主力1.0 / 準主力0.6 / 快適系0.3 / 効果なし0）を掛ける
 * 4. 護石自体のスロットも、そこに装飾品を付けられる分の価値として足す
 */

export const WEAPON_SIDE_FACTOR = 2

export type TalismanSkill = { name: string; level: number }
export type TalismanSlot = { type: DecorationType; level: number }
export type Talisman = { skills: TalismanSkill[]; slots: TalismanSlot[] }

export type BreakdownRow =
  | {
      kind: 'skill'
      skill: TalismanSkill
      /** 代わりになる装飾品の組み合わせ（例: 攻撃珠Ⅲ【3】×1） */
      decos: { decoration: Decoration; count: number }[]
      slotLevels: number
      side: DecorationType
      importance: ImportanceLevel | 'none'
      points: number
    }
  | { kind: 'slot'; slot: TalismanSlot; points: number }

export type Grade = { rank: 'S' | 'A' | 'B' | 'C' | 'D'; label: string; min: number }

/** 評価の基準（点数の下限）。数値の意味は画面の「評価のしくみ」に記載 */
export const GRADES: Grade[] = [
  { rank: 'S', label: '神おま', min: 10 },
  { rank: 'A', label: '強おま', min: 6 },
  { rank: 'B', label: '良おま', min: 4 },
  { rank: 'C', label: '並おま', min: 2 },
  { rank: 'D', label: 'いまいち', min: 0 },
]

export const gradeOf = (points: number) => GRADES.find((g) => points >= g.min) ?? GRADES[GRADES.length - 1]

/** スキルごとの単体装飾品（複合装飾品は2つのスキルを持つので換算には使わない） */
const singleDecos = new Map<string, Decoration[]>()
for (const d of decorations) {
  if (d.skills.length !== 1) continue
  const name = d.skills[0].name
  singleDecos.set(name, [...(singleDecos.get(name) ?? []), d])
}

/** 護石で扱えるスキル（単体の装飾品があるもの）。五十音順 */
export const talismanSkillNames = [...singleDecos.keys()].sort((a, b) => a.localeCompare(b, 'ja'))

/** 護石で選べる最大Lv（スキルの最大Lvと、鑑定護石で確認されている上限4の小さい方） */
export const talismanMaxLevel = (skill: string) => Math.min(skillMax[skill] ?? 1, 4)

/**
 * スキル Lv を装飾品で付けるときの、スロットLv合計が最小になる組み合わせ。
 * 同じ合計なら装飾品の個数が少ない方を選ぶ。
 */
export function cheapestDecos(skill: string, level: number) {
  const options = singleDecos.get(skill) ?? []
  type Best = { cost: number; count: number; picks: Decoration[] }
  const best: (Best | null)[] = Array.from({ length: level + 1 }, () => null)
  best[0] = { cost: 0, count: 0, picks: [] }
  for (let lv = 1; lv <= level; lv++) {
    for (const d of options) {
      const prev = best[Math.max(0, lv - d.skills[0].level)]
      if (!prev) continue
      const cand = { cost: prev.cost + d.slot, count: prev.count + 1, picks: [...prev.picks, d] }
      const cur = best[lv]
      if (!cur || cand.cost < cur.cost || (cand.cost === cur.cost && cand.count < cur.count)) best[lv] = cand
    }
  }
  const result = best[level]
  if (!result) return null
  const grouped = new Map<number, { decoration: Decoration; count: number }>()
  for (const d of result.picks) {
    const g = grouped.get(d.id)
    if (g) g.count++
    else grouped.set(d.id, { decoration: d, count: 1 })
  }
  return { slotLevels: result.cost, decos: [...grouped.values()], side: options[0].type }
}

export function evaluate(t: Talisman, weapon: Weapon) {
  const rows: BreakdownRow[] = []
  for (const skill of t.skills) {
    const c = cheapestDecos(skill.name, skill.level)
    if (!c) continue
    const applies = skillAppliesTo(skill.name, weapon)
    const importance = applies ? importanceOf(skill.name, weapon) : 'none'
    const factor = c.side === 'weapon' ? WEAPON_SIDE_FACTOR : 1
    const weight = importance === 'none' ? 0 : IMPORTANCE[importance]
    rows.push({ kind: 'skill', skill, ...c, importance, points: c.slotLevels * factor * weight })
  }
  for (const slot of t.slots) {
    rows.push({ kind: 'slot', slot, points: slot.level * (slot.type === 'weapon' ? WEAPON_SIDE_FACTOR : 1) })
  }
  const points = rows.reduce((sum, r) => sum + r.points, 0)
  return { points, grade: gradeOf(points), rows }
}

export function evaluateAllWeapons(t: Talisman) {
  return WEAPONS.map((weapon) => ({ weapon, ...evaluate(t, weapon) })).sort((a, b) => b.points - a.points)
}

export const describeDecos = (decos: { decoration: Decoration; count: number }[]) =>
  decos.map((d) => `${displayName(d.decoration)}×${d.count}`).join(' + ')

export const importanceText = (i: ImportanceLevel | 'none') =>
  i === 'none' ? '効果なし ×0' : `${IMPORTANCE_LABEL[i]} ×${IMPORTANCE[i]}`
