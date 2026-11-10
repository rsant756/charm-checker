import { describe, expect, it } from 'vitest'
import { cheapestDecos, evaluate, talismanSkillNames } from './talisman'

const t = (skills: [string, number][], slots: ['weapon' | 'armor', number][] = []) => ({
  skills: skills.map(([name, level]) => ({ name, level })),
  slots: slots.map(([type, level]) => ({ type, level })),
})

describe('装飾品換算', () => {
  it('攻撃Lv3 は攻撃珠Ⅲ【3】1個（スロット3）', () => {
    const c = cheapestDecos('攻撃', 3)!
    expect(c.slotLevels).toBe(3)
    expect(c.decos.map((d) => [d.decoration.name, d.count])).toEqual([['攻撃珠Ⅲ', 1]])
    expect(c.side).toBe('weapon')
  })
  it('体術Lv3 は体術珠【1】3個', () => {
    const c = cheapestDecos('体術', 3)!
    expect(c.slotLevels).toBe(3)
    expect(c.decos[0].count).toBe(3)
  })
  it('弱点特効Lv1 は痛撃珠【3】1個（スロット3）', () => {
    expect(cheapestDecos('弱点特効', 1)!.slotLevels).toBe(3)
  })
  it('護石で選べるスキルは全スキル', () => {
    expect(talismanSkillNames.length).toBe(117)
  })
})

describe('評価', () => {
  it('攻撃Lv3: 3スロLv × 武器2 × 主力1.0 = 6点', () => {
    expect(evaluate(t([['攻撃', 3]]), '大剣').points).toBe(6)
  })
  it('効果のない武器では0点', () => {
    expect(evaluate(t([['抜刀術【技】', 3]]), '弓').points).toBe(0)
  })
  it('同じ護石でも武器種で評価が変わる', () => {
    const charm = t([['抜刀術【技】', 3]], [['armor', 1]])
    const gs = evaluate(charm, '大剣')
    const gl = evaluate(charm, 'ガンランス')
    expect(gs.points).toBeGreaterThan(gl.points)
    expect(gs.grade.rank).not.toBe(gl.grade.rank)
  })
  it('武器スロ①は2点、防具スロ③は3点', () => {
    expect(evaluate(t([], [['weapon', 1]]), '大剣').points).toBe(2)
    expect(evaluate(t([], [['armor', 3]]), '大剣').points).toBe(3)
  })
  it('攻撃Lv3+弱点特効Lv1+武器スロ① は S', () => {
    expect(evaluate(t([['攻撃', 3], ['弱点特効', 1]], [['weapon', 1]]), '太刀').grade.rank).toBe('S')
  })
})
