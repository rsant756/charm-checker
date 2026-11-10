// 引き継ぎコード（このサイト独自の形式）
//
//   MHWS1-XXXX-XXXX-…-XX
//   │    │               └ 末尾2文字: 検算用（1文字でも違えば読み込み失敗として検出）
//   │    └ 所持数データ（Crockford Base32、4文字ごとにハイフン）
//   └ 形式名とバージョン。将来形式を変えても古いコードを読めるようにする
//
// 所持状況に関係なく、いつも同じ長さ・同じ形になる（固定長）。
//
// データの中身（ビット列）:
//   [ID数: 12bit] + ID 1〜N それぞれの所持数
//   所持数は 0〜6 を 3bit、7 以上は「111」の後に 7bit で実数（最大 99）
// 文字は Crockford Base32（0-9 と A-Z から I L O U を除いた32文字）。
// 大文字・数字・ハイフンだけなので、手で書き写すときも紛らわしい文字がない。
import type { Owned } from './storage'
import { MAX_COUNT } from './storage'

const PREFIX = 'MHWS1'
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const ID_BITS = 12
const SMALL_BITS = 3
const ESCAPE = (1 << SMALL_BITS) - 1 // 7
const LARGE_BITS = 7
const CHECK_CHARS = 2

class BitWriter {
  bits: number[] = []
  write(value: number, width: number) {
    for (let i = width - 1; i >= 0; i--) this.bits.push((value >> i) & 1)
  }
}

class BitReader {
  private pos = 0
  private bits: number[]
  constructor(bits: number[]) {
    this.bits = bits
  }
  read(width: number): number {
    if (this.pos + width > this.bits.length) throw new Error('データが短すぎます')
    let v = 0
    for (let i = 0; i < width; i++) v = (v << 1) | this.bits[this.pos++]
    return v
  }
}

/** 文字列（Base32 の各文字の値の並び）から検算値を計算する */
function checksum(values: number[]): number[] {
  // 位置で重み付けした和（隣り合う文字の入れ替えも検出できる）を 32*32 で割った余り
  let a = 1
  let b = 0
  for (const v of values) {
    a = (a + v) % 1021
    b = (b + a) % 1021
  }
  const sum = (a * 31 + b) % (32 * 32)
  return [Math.floor(sum / 32), sum % 32]
}

/** 所持データ → 引き継ぎコード。maxId は装飾品IDの最大値 */
export function encodeTransferCode(owned: Owned, maxId: number): string {
  const w = new BitWriter()
  w.write(maxId, ID_BITS)
  for (let id = 1; id <= maxId; id++) {
    const n = Math.min(owned.get(id) ?? 0, MAX_COUNT)
    if (n < ESCAPE) w.write(n, SMALL_BITS)
    else {
      w.write(ESCAPE, SMALL_BITS)
      w.write(n, LARGE_BITS)
    }
  }
  while (w.bits.length % 5 !== 0) w.bits.push(0)
  const values: number[] = []
  for (let i = 0; i < w.bits.length; i += 5) {
    values.push(w.bits.slice(i, i + 5).reduce((acc, bit) => (acc << 1) | bit, 0))
  }
  const body = [...values, ...checksum(values)].map((v) => ALPHABET[v]).join('')
  return [PREFIX, ...(body.match(/.{1,4}/g) ?? [])].join('-')
}

export class TransferCodeError extends Error {}

/**
 * 引き継ぎコード → 所持データ。
 * 前後の空白・改行・ハイフンの有無・大文字小文字の違いは無視する。
 * 書き写し時に間違えやすい O→0、I/L→1 は自動で読み替える（Crockford Base32 の規則）。
 */
export function decodeTransferCode(input: string): Owned {
  const cleaned = input.toUpperCase().replace(/[\s-]/g, '')
  if (!cleaned.startsWith(PREFIX)) throw new TransferCodeError('引き継ぎコードではありません（MHWS1 で始まるコードを入力してください）')
  const chars = cleaned.slice(PREFIX.length).replace(/O/g, '0').replace(/[IL]/g, '1')
  const values = [...chars].map((c) => {
    const v = ALPHABET.indexOf(c)
    if (v < 0) throw new TransferCodeError(`使えない文字「${c}」が含まれています`)
    return v
  })
  if (values.length <= CHECK_CHARS) throw new TransferCodeError('コードが短すぎます')
  const data = values.slice(0, -CHECK_CHARS)
  const [c1, c2] = checksum(data)
  if (values.at(-2) !== c1 || values.at(-1) !== c2) {
    throw new TransferCodeError('コードが正しくありません（途中で欠けているか、書き間違いがあります）')
  }
  const bits = data.flatMap((v) => [4, 3, 2, 1, 0].map((i) => (v >> i) & 1))
  const r = new BitReader(bits)
  try {
    const maxId = r.read(ID_BITS)
    const owned: Owned = new Map()
    for (let id = 1; id <= maxId; id++) {
      let n = r.read(SMALL_BITS)
      if (n === ESCAPE) n = r.read(LARGE_BITS)
      n = Math.min(n, MAX_COUNT)
      if (n > 0) owned.set(id, n)
    }
    return owned
  } catch {
    throw new TransferCodeError('コードが正しくありません（データが途中で切れています）')
  }
}

/** URL の ?code= に入れて使う（Base32 とハイフンだけなのでエスケープ不要） */
export const TRANSFER_PARAM = 'code'
