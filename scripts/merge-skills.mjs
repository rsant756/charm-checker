// scripts/skills-source.csv（name,type,skills）のスキル情報を decorations.json に結合する
// 出典: https://wilds.gameconductor.com/decoration/ （2026-11-10 取得）
// usage: node scripts/merge-skills.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const DATA = new URL('../src/data/decorations.json', import.meta.url)
const CSV = new URL('./skills-source.csv', import.meta.url)

const rows = readFileSync(CSV, 'utf8').trim().split(/\r?\n/).slice(1)
const byName = new Map()
for (const line of rows) {
  const [name, type, skillsText] = line.split(',')
  if (byName.has(name)) throw new Error(`重複: ${name}`)
  const skills = skillsText.split('+').map((s) => {
    const m = /^(.+)Lv(\d)$/.exec(s)
    if (!m) throw new Error(`スキル表記が不正: ${name} ${s}`)
    return { name: m[1], level: Number(m[2]) }
  })
  // 表示用にレベルの高いスキルを先に（同レベルは出典の順）
  skills.sort((a, b) => b.level - a.level)
  byName.set(name, { type, skills })
}

const decorations = JSON.parse(readFileSync(DATA, 'utf8'))
const missing = []
const merged = decorations.map((d) => {
  const s = byName.get(d.name)
  if (!s) {
    missing.push(d.name)
    return d
  }
  byName.delete(d.name)
  const { id, name, slot, rarity, addedIn } = d
  return { id, name, slot, rarity, type: s.type, skills: s.skills, ...(addedIn ? { addedIn } : {}) }
})

if (missing.length || byName.size) {
  console.error('一致しない装飾品があります')
  console.error('データ側のみ:', missing)
  console.error('CSV側のみ:', [...byName.keys()])
  process.exit(1)
}

writeFileSync(DATA, JSON.stringify(merged, null, 2) + '\n')
console.log(`${merged.length} 件にスキル情報を結合しました`)
