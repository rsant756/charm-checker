import { describe, expect, it } from 'vitest'
import { decorations } from '../data'
import { decodeTransferCode, encodeTransferCode, TransferCodeError } from './transferCode'

const maxId = Math.max(...decorations.map((d) => d.id))

describe('引き継ぎコード', () => {
  it('MHWS1- で始まり、4文字ごとにハイフン区切り', () => {
    const code = encodeTransferCode(new Map([[1, 2]]), maxId)
    expect(code).toMatch(/^MHWS1(-[0-9A-HJKMNP-TV-Z]{1,4})+$/)
  })

  it('書き出し → 読み込みで同じ所持数に戻る（大きい個数も）', () => {
    const owned = new Map([
      [1, 1],
      [2, 6],
      [3, 7],
      [100, 99],
      [maxId, 3],
    ])
    expect(decodeTransferCode(encodeTransferCode(owned, maxId))).toEqual(owned)
  })

  it('所持状況に関係なく同じ長さ（個数が7個未満の場合）', () => {
    const all = new Map(decorations.map((d) => [d.id, 5]))
    const code = encodeTransferCode(all, maxId)
    expect(encodeTransferCode(new Map(), maxId).length).toBe(code.length)
    expect(encodeTransferCode(new Map([[3, 1]]), maxId).length).toBe(code.length)
    expect(decodeTransferCode(code)).toEqual(all)
  })

  it('空白・改行・小文字・ハイフン抜けでも読める', () => {
    const owned = new Map([[5, 2]])
    const code = encodeTransferCode(owned, maxId)
    const messy = `  ${code.toLowerCase().replace(/-/g, '')}\n`
    expect(decodeTransferCode(messy)).toEqual(owned)
  })

  it('1文字でも書き間違えると検出する', () => {
    const code = encodeTransferCode(new Map([[10, 2]]), maxId)
    const i = code.length - 8
    const wrong = code.slice(0, i) + (code[i] === 'A' ? 'B' : 'A') + code.slice(i + 1)
    expect(() => decodeTransferCode(wrong)).toThrow(TransferCodeError)
  })

  it('隣り合う文字の入れ替えも検出する', () => {
    const code = encodeTransferCode(new Map([[1, 1], [2, 3], [3, 5]]), maxId)
    const body = code.replace(/-/g, '')
    for (let i = 5; i < body.length - 3; i++) {
      if (body[i] === body[i + 1]) continue
      const swapped = body.slice(0, i) + body[i + 1] + body[i] + body.slice(i + 2)
      expect(() => decodeTransferCode(swapped)).toThrow(TransferCodeError)
      return
    }
  })

  it('別のコード・空文字は読み込まない', () => {
    expect(() => decodeTransferCode('')).toThrow(TransferCodeError)
    expect(() => decodeTransferCode('ABCD-EFGH')).toThrow(TransferCodeError)
  })

  it('将来装飾品が増えても（ID数が違っても）読める', () => {
    const owned = new Map([[400, 2]])
    expect(decodeTransferCode(encodeTransferCode(owned, 420))).toEqual(owned)
  })
})
