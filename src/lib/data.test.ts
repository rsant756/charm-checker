import { describe, expect, it } from 'vitest'
import { decorations, displayName, neededCount, skillMax } from '../data'
import { filterDecorations } from './filter'
import { completionStat, overallStat } from './stats'
import { parseMhws, serializeMhws } from './storage'
// 2025-07-12 公開版の charms.json（ID 互換性チェックの基準）
import legacyRaw from '../../scripts/legacy-charms.json'

type Legacy = { 'data-id': number; 'data-name': string; 'data-sort2': number }
const legacy: Legacy[] = legacyRaw

describe('decorations データ', () => {
  it('ID が重複していない', () => {
    expect(new Set(decorations.map((d) => d.id)).size).toBe(decorations.length)
  })

  it('旧版（2025-07-12 公開）の ID・名前・レア度が変わっていない（.mhws 互換）', () => {
    const byId = new Map(decorations.map((d) => [d.id, d]))
    for (const c of legacy) {
      const d = byId.get(c['data-id'])
      expect(d, `id ${c['data-id']}`).toBeDefined()
      expect(displayName(d!)).toBe(c['data-name'])
      expect(d!.rarity).toBe(c['data-sort2'])
    }
  })

  it('スロットLvは 1〜3', () => {
    for (const d of decorations) expect([1, 2, 3]).toContain(d.slot)
  })

  it('全装飾品に種別とスキルがある', () => {
    for (const d of decorations) {
      expect(['weapon', 'armor']).toContain(d.type)
      expect(d.skills.length, d.name).toBeGreaterThan(0)
      for (const s of d.skills) expect(s.level).toBeGreaterThan(0)
    }
  })
})

describe('検索・絞り込み', () => {
  const none = new Map<number, number>()
  const base = { ownership: 'all', rarity: 'all', type: 'all', search: '' } as const
  const names = (search: string) =>
    filterDecorations(decorations, none, { ...base, search }).map((d) => d.name)

  it('スキル名で複合装飾品も見つかる', () => {
    const r = names('業物')
    expect(r).toContain('業物珠')
    expect(r).toContain('破龍・業物珠') // 名前にもスキルにも業物を含む
    expect(r).toContain('業物・KO珠')
  })

  it('スキル名だけで装飾品名に含まれないものも見つかる', () => {
    expect(names('見切り')).toEqual(expect.arrayContaining(['達人珠', '飛燕・達人珠']))
  })

  it('全角半角・大文字小文字を区別しない', () => {
    expect(names('ko')).toContain('KO珠')
    expect(names('ＫＯ')).toContain('KO珠')
    expect(names('回避距離up')).toContain('跳躍珠')
  })

  it('空白区切りは AND 検索', () => {
    expect(names('匠 火属性')).toEqual(['火炎・匠珠'])
  })

  it('種別で絞り込める', () => {
    const armor = filterDecorations(decorations, none, { ...base, type: 'armor' })
    expect(armor.length).toBe(66)
  })
})

describe('.mhws 入出力', () => {
  it('旧アプリ（1.0）の形式はチェック済み＝1個として読める', () => {
    expect(parseMhws('{"version":"1.0","checkedItems":[3,1,2]}')).toEqual(
      new Map([
        [3, 1],
        [1, 1],
        [2, 1],
      ]),
    )
  })

  it('書き出し→読み込みで同じ所持数に戻る', () => {
    const owned = new Map([
      [5, 3],
      [1, 1],
      [300, 2],
    ])
    expect(parseMhws(serializeMhws(owned))).toEqual(owned)
  })

  it('新形式にも checkedItems を含む（旧形式との互換）', () => {
    const data = JSON.parse(serializeMhws(new Map([[7, 2]])))
    expect(data.checkedItems).toEqual([7])
    expect(data.counts).toEqual({ 7: 2 })
  })

  it('不正な個数は丸める・捨てる', () => {
    expect(parseMhws('{"counts":{"1":-2,"2":1000,"3":2.7,"x":1}}')).toEqual(
      new Map([
        [2, 99],
        [3, 2],
      ]),
    )
  })

  it('不正なファイルは例外', () => {
    expect(() => parseMhws('dec0100000')).toThrow()
    expect(() => parseMhws('{"foo":1}')).toThrow()
  })
})

describe('必要数', () => {
  const byName = (n: string) => decorations.find((d) => d.name === n)!

  it('全スキルに最大Lvがあり、装飾品のLvは最大Lv以下', () => {
    for (const d of decorations)
      for (const s of d.skills) {
        expect(skillMax[s.name], s.name).toBeGreaterThan(0)
        expect(s.level).toBeLessThanOrEqual(skillMax[s.name])
      }
  })

  it('単体スキル: 最大Lv ÷ 珠のLv（切り上げ）', () => {
    expect(neededCount(byName('攻撃珠'))).toBe(5) // 攻撃 最大Lv5
    expect(neededCount(byName('攻撃珠Ⅱ'))).toBe(3)
    expect(neededCount(byName('攻撃珠Ⅲ'))).toBe(2)
    expect(neededCount(byName('業物珠'))).toBe(3) // 業物 最大Lv3
  })

  it('複合: どのスキルも上限を超えない個数', () => {
    expect(neededCount(byName('業物・匠珠'))).toBe(1) // 業物Lv3（最大3）が先にあふれる
  })
})

describe('取得率', () => {
  it('数値で計算される（旧版の共有率 0.00% バグの回帰防止）', () => {
    const s = overallStat(
      decorations,
      new Map([
        [1, 1],
        [2, 4],
      ]),
    )
    expect(typeof s.percent).toBe('number')
    expect(s.percent).toBeCloseTo((2 / decorations.length) * 100)
  })

  it('コンプ率は必要数を超えた分を数えない', () => {
    const atk = decorations.find((d) => d.name === '攻撃珠')!
    const one = [atk]
    expect(completionStat(one, new Map([[atk.id, 2]])).percent).toBeCloseTo(40)
    expect(completionStat(one, new Map([[atk.id, 9]])).percent).toBe(100)
  })
})
