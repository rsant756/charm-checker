// scripts/skill-max-source.csv から src/data/skills.json（スキル名 → 最大Lv）を生成する
// 出典: https://wilds.gameconductor.com/skill/ （2026-11-10 取得）
// weapons 列は武器種フィルタ用の下調べ（未検証）のため、ここではまだ出力しない
import { readFileSync, writeFileSync } from 'node:fs'

const rows = readFileSync(new URL('./skill-max-source.csv', import.meta.url), 'utf8').trim().split(/\r?\n/).slice(1)
const skills = {}
for (const line of rows) {
  const [name, max] = line.split(',')
  if (name in skills) throw new Error(`重複: ${name}`)
  if (!/^\d+$/.test(max)) throw new Error(`最大Lvが不正: ${name}`)
  skills[name] = Number(max)
}
writeFileSync(new URL('../src/data/skills.json', import.meta.url), JSON.stringify(skills, null, 2) + '\n')
console.log(`${Object.keys(skills).length} スキルを書き出しました`)
