import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { IMPORTANCE, importanceOf } from '../data/talismanWeights'
import { WEAPONS, skillAppliesTo, type Weapon } from '../data/weapons'
import {
  GRADES,
  WEAPON_SIDE_FACTOR,
  describeDecos,
  evaluateAllWeapons,
  importanceText,
  talismanMaxLevel,
  talismanSkillNames,
  type Talisman,
  type TalismanSlot,
} from '../lib/talisman'

const fieldClass = 'rounded border border-gray-300 bg-white px-2 py-2'

/** スロットの選択肢（鑑定護石のスロットは最大3つ。武器スロは1枠目のみ） */
const SLOT_OPTIONS: { value: string; label: string; slot: TalismanSlot | null }[] = [
  { value: '', label: 'なし', slot: null },
  { value: 'w1', label: '武器スロ①', slot: { type: 'weapon', level: 1 } },
  { value: 'a3', label: '防具スロ③', slot: { type: 'armor', level: 3 } },
  { value: 'a2', label: '防具スロ②', slot: { type: 'armor', level: 2 } },
  { value: 'a1', label: '防具スロ①', slot: { type: 'armor', level: 1 } },
]

const RANK_COLOR: Record<string, string> = {
  S: 'bg-yellow-400 text-gray-900',
  A: 'bg-red-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-gray-400 text-white',
  D: 'bg-gray-200 text-gray-600',
}

type SkillInput = { name: string; level: number }
const EMPTY_SKILLS: SkillInput[] = [
  { name: '', level: 1 },
  { name: '', level: 1 },
  { name: '', level: 1 },
]

/** 棒グラフの最大値（これ以上は満タン表示） */
const BAR_MAX = 14

export default function TalismanPage() {
  const [skills, setSkills] = useState<SkillInput[]>(EMPTY_SKILLS)
  const [slots, setSlots] = useState<string[]>(['', '', ''])
  const [selected, setSelected] = useState<Weapon | null>(null)

  const talisman: Talisman = useMemo(
    () => ({
      skills: skills
        .filter((s) => talismanSkillNames.includes(s.name))
        .map((s) => ({ name: s.name, level: Math.min(s.level, talismanMaxLevel(s.name)) })),
      slots: slots.map((v) => SLOT_OPTIONS.find((o) => o.value === v)?.slot).filter((s): s is TalismanSlot => !!s),
    }),
    [skills, slots],
  )
  const hasInput = talisman.skills.length > 0 || talisman.slots.length > 0
  const results = useMemo(() => evaluateAllWeapons(talisman), [talisman])
  const detail = results.find((r) => r.weapon === selected) ?? results[0]

  const setSkill = (i: number, patch: Partial<SkillInput>) =>
    setSkills((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  const reset = () => {
    setSkills(EMPTY_SKILLS)
    setSlots(['', '', ''])
    setSelected(null)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <header className="rounded-lg bg-white p-4 shadow">
          <h1 className="text-2xl font-bold">護石チェッカー</h1>
          <p className="mt-1 text-sm text-gray-600">
            鑑定護石のスキルとスロットを入力すると、<strong>武器種ごと</strong>に当たりかどうかを判定します。
            評価は「装飾品何個分の働きをするか」で計算し、内訳もすべて表示します。
          </p>
        </header>

        <section className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-3 font-bold">護石を入力</h2>
          <datalist id="talisman-skills">
            {talismanSkillNames.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <div className="space-y-2">
            {skills.map((s, i) => {
              const valid = talismanSkillNames.includes(s.name)
              const max = valid ? talismanMaxLevel(s.name) : 1
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-sm font-semibold">スキル{i + 1}</span>
                  <input
                    type="search"
                    list="talisman-skills"
                    placeholder="スキル名"
                    aria-label={`スキル${i + 1}`}
                    value={s.name}
                    onChange={(e) => setSkill(i, { name: e.target.value })}
                    className={`${fieldClass} min-w-0 flex-1 ${s.name && !valid ? 'border-red-400' : ''}`}
                  />
                  <select
                    aria-label={`スキル${i + 1}のLv`}
                    value={Math.min(s.level, max)}
                    disabled={!valid}
                    onChange={(e) => setSkill(i, { level: Number(e.target.value) })}
                    className={`${fieldClass} w-20 disabled:opacity-50`}
                  >
                    {Array.from({ length: max }, (_, k) => k + 1).map((lv) => (
                      <option key={lv} value={lv}>
                        Lv{lv}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="w-14 shrink-0 text-sm font-semibold">スロット</span>
              {slots.map((v, i) => (
                <select
                  key={i}
                  aria-label={`スロット${i + 1}`}
                  value={v}
                  onChange={(e) => setSlots((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                  className={fieldClass}
                >
                  {SLOT_OPTIONS.filter((o) => i === 0 || o.slot?.type !== 'weapon').map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
          <div className="mt-3 text-right">
            <button type="button" onClick={reset} className="text-sm text-blue-600 hover:underline">
              リセット
            </button>
          </div>
        </section>

        {hasInput && (
          <section className="rounded-lg bg-white p-4 shadow">
            <h2 className="mb-3 font-bold">武器種ごとの評価</h2>
            <ul className="space-y-1">
              {results.map((r) => (
                <li key={r.weapon}>
                  <button
                    type="button"
                    onClick={() => setSelected(r.weapon)}
                    className={`flex w-full items-center gap-3 rounded px-2 py-1.5 text-left hover:bg-gray-50 ${
                      detail.weapon === r.weapon ? 'bg-blue-50 ring-1 ring-blue-200' : ''
                    }`}
                  >
                    <span className="w-28 shrink-0 text-sm sm:w-36">{r.weapon}</span>
                    <span className={`w-24 shrink-0 whitespace-nowrap rounded px-2 py-0.5 text-center text-sm font-bold ${RANK_COLOR[r.grade.rank]}`}>
                      {r.grade.rank} {r.grade.label}
                    </span>
                    <span className="hidden h-2 flex-1 overflow-hidden rounded bg-gray-100 sm:block">
                      <span
                        className="block h-full bg-blue-400"
                        style={{ width: `${Math.min(100, (r.points / BAR_MAX) * 100)}%` }}
                      />
                    </span>
                    <span className="ml-auto w-12 shrink-0 text-right text-sm tabular-nums">{r.points.toFixed(1)}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
              <h3 className="mb-2 font-semibold">
                {detail.weapon}での計算の内訳（{detail.points.toFixed(1)}点 → {detail.grade.rank} {detail.grade.label}）
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="py-1 pr-2 font-normal">項目</th>
                      <th className="py-1 pr-2 font-normal">装飾品に換算</th>
                      <th className="py-1 pr-2 font-normal">計算</th>
                      <th className="py-1 text-right font-normal">点</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.rows.map((row, i) =>
                      row.kind === 'skill' ? (
                        <tr key={i} className="border-t border-blue-100">
                          <td className="py-1 pr-2">
                            {row.skill.name}Lv{row.skill.level}
                          </td>
                          <td className="py-1 pr-2">{describeDecos(row.decos)}</td>
                          <td className="py-1 pr-2 text-gray-600">
                            スロットLv{row.slotLevels}
                            {row.side === 'weapon' ? ` × 武器${WEAPON_SIDE_FACTOR}` : ' × 防具1'} × {importanceText(row.importance)}
                          </td>
                          <td className="py-1 text-right tabular-nums">{row.points.toFixed(1)}</td>
                        </tr>
                      ) : (
                        <tr key={i} className="border-t border-blue-100">
                          <td className="py-1 pr-2">{row.slot.type === 'weapon' ? '武器' : '防具'}スロ{row.slot.level}</td>
                          <td className="py-1 pr-2 text-gray-600">好きな装飾品を付けられる</td>
                          <td className="py-1 pr-2 text-gray-600">
                            スロットLv{row.slot.level}
                            {row.slot.type === 'weapon' ? ` × 武器${WEAPON_SIDE_FACTOR}` : ' × 防具1'}
                          </td>
                          <td className="py-1 text-right tabular-nums">{row.points.toFixed(1)}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-gray-500">武器名を押すと、その武器での内訳に切り替わります。</p>
            </div>
          </section>
        )}

        <HowItWorks />
      </div>
    </Layout>
  )
}

function HowItWorks() {
  return (
    <section className="rounded-lg bg-white p-4 text-sm leading-relaxed shadow">
      <h2 className="mb-3 text-lg font-bold">評価のしくみ</h2>
      <p>
        護石の価値を「<strong>そのスキルを装飾品で付けるとしたら、スロットがいくつ必要か</strong>」で数えます。
        護石に付いているスキルの分だけ、装備のスロットが空き、ほかの装飾品を付けられるからです。
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>
          <strong>装飾品に換算</strong>：スキルLvを、スロットが最も少なく済む装飾品の組み合わせに置き換えます。
          <br />
          例）攻撃Lv3 → 攻撃珠Ⅲ【3】1個＝スロットLv3 ／ 体術Lv3 → 体術珠【1】3個＝スロットLv3 ／ 弱点特効Lv1 → 痛撃珠【3】1個＝スロットLv3
        </li>
        <li>
          <strong>武器スロは2倍</strong>：武器用の装飾品は武器のスロット（最大3つ）にしか付けられず、防具のスロットより貴重なため、
          武器スキル・武器スロは{WEAPON_SIDE_FACTOR}倍で数えます。
        </li>
        <li>
          <strong>その武器での重要度</strong>を掛けます：主力×{IMPORTANCE.core}／準主力×{IMPORTANCE.sub}／快適系×{IMPORTANCE.utility}／
          その武器で効果がないスキル×0。
          <br />
          主力は攻撃・見切り・弱点特効・超会心などの火力スキルと、各武器の看板スキル（大剣の集中・抜刀術【技】、ガンランスの砲術・砲弾装填 など）です。
        </li>
        <li>
          <strong>護石のスロット</strong>は、そこに装飾品を付けられる分の価値として、スロットLv（武器スロは{WEAPON_SIDE_FACTOR}倍）を足します。
        </li>
      </ol>
      <h3 className="mt-4 font-semibold">評価の基準</h3>
      <table className="mt-1 text-sm">
        <tbody>
          {GRADES.map((g, i) => (
            <tr key={g.rank}>
              <td className="pr-3">
                <span className={`inline-block w-24 whitespace-nowrap rounded px-2 py-0.5 text-center font-bold ${RANK_COLOR[g.rank]}`}>
                  {g.rank} {g.label}
                </span>
              </td>
              <td className="py-0.5 text-gray-700">
                {g.min}点以上{i > 0 ? `${GRADES[i - 1].min}点未満` : ''}
                {g.rank === 'S' && '（例：攻撃Lv3＋弱点特効Lv1＋武器スロ①＝11点）'}
                {g.rank === 'A' && '（例：攻撃Lv3＝6点）'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold text-blue-700">武器ごとの主力・準主力スキル一覧</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-1 pr-2 font-normal">武器</th>
                <th className="py-1 pr-2 font-normal">主力（×{IMPORTANCE.core}）</th>
                <th className="py-1 font-normal">準主力（×{IMPORTANCE.sub}）</th>
              </tr>
            </thead>
            <tbody>
              {WEAPONS.map((w) => {
                const usable = talismanSkillNames.filter((s) => skillAppliesTo(s, w))
                return (
                  <tr key={w} className="border-t align-top">
                    <td className="py-1 pr-2 whitespace-nowrap">{w}</td>
                    <td className="py-1 pr-2">{usable.filter((s) => importanceOf(s, w) === 'core').join('・')}</td>
                    <td className="py-1">{usable.filter((s) => importanceOf(s, w) === 'sub').join('・')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-gray-500">上記以外のスキルは快適系（×{IMPORTANCE.utility}）です。</p>
        </div>
      </details>
      <p className="mt-3 text-xs text-gray-500">
        ※ スキルの重要度は製作者の判断によるものです。ご意見があれば「ご意見・ご要望」からお知らせください。
      </p>
    </section>
  )
}
