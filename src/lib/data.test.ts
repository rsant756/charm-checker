import { describe, expect, it } from 'vitest'
import { decorations, displayName } from '../data'
import { overallStat } from './stats'
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
})

describe('.mhws 入出力', () => {
  it('旧アプリが書き出した形式を読める', () => {
    expect(parseMhws('{"version":"1.0","checkedItems":[3,1,2]}')).toEqual([3, 1, 2])
  })

  it('書き出し→読み込みで同じ ID に戻る', () => {
    const ids = new Set([5, 1, 300])
    expect(new Set(parseMhws(serializeMhws(ids)))).toEqual(ids)
  })

  it('不正なファイルは例外', () => {
    expect(() => parseMhws('dec0100000')).toThrow()
    expect(() => parseMhws('{"foo":1}')).toThrow()
  })
})

describe('取得率', () => {
  it('数値で計算される（旧版の共有率 0.00% バグの回帰防止）', () => {
    const s = overallStat(decorations, new Set([1, 2]))
    expect(typeof s.percent).toBe('number')
    expect(s.percent).toBeCloseTo((2 / decorations.length) * 100)
  })
})
