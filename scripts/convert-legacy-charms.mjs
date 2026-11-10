// 旧 charms.json（data-id / data-name / data-sort2）を新形式 decorations.json に変換する一回限りのスクリプト
// usage: node scripts/convert-legacy-charms.mjs <legacy charms.json> <out decorations.json>
import { readFileSync, writeFileSync } from 'node:fs'

const [src, out] = process.argv.slice(2)
const legacy = JSON.parse(readFileSync(src, 'utf8'))

const decorations = legacy.map((c) => {
  const m = /^(.+)【(\d)】$/.exec(c['data-name'])
  if (!m) throw new Error(`スロット表記が見つかりません: ${c['data-name']}`)
  return { id: c['data-id'], name: m[1], slot: Number(m[2]), rarity: c['data-sort2'] }
})

writeFileSync(out, JSON.stringify(decorations, null, 2) + '\n')
console.log(`${decorations.length} 件を書き出しました -> ${out}`)
