import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import DecorationCard from '../components/DecorationCard'
import Tour from '../components/Tour'
import { hasSeenTour, markTourSeen } from '../components/tour/seen'
import Indicator from '../components/Indicator'
import Layout from '../components/Layout'
import { decorations, skillNames } from '../data'
import { WEAPONS, weaponSpecificity } from '../data/weapons'
import { filterDecorations } from '../lib/filter'
import { completionStat, countOf, formatPercent, overallStat } from '../lib/stats'
import { MAX_COUNT, loadFromStorage, parseMhws, saveToStorage, serializeMhws, type Owned } from '../lib/storage'
import type { Filters, OwnershipFilter } from '../types'

const fieldClass = 'rounded border border-gray-300 bg-white px-2 py-2 sm:px-3'
const knownIds = new Set(decorations.map((d) => d.id))
const rarityOptions = [...new Set(decorations.map((d) => d.rarity))].sort((a, b) => a - b)
const INITIAL_FILTERS: Filters = { ownership: 'all', rarity: 'all', type: 'all', weapon: 'all', search: '' }

export default function CheckerPage() {
  const [owned, setOwned] = useState<Owned>(loadFromStorage)
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const fileInput = useRef<HTMLInputElement>(null)
  const [tourOpen, setTourOpen] = useState(false)

  // 初回訪問時だけ使い方を自動表示（レイアウトが落ち着いてから）
  useEffect(() => {
    if (hasSeenTour()) return
    const t = setTimeout(() => setTourOpen(true), 600)
    return () => clearTimeout(t)
  }, [])

  const closeTour = () => {
    markTourSeen()
    setTourOpen(false)
  }

  useEffect(() => {
    saveToStorage(owned)
  }, [owned])

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const setCount = (id: number, count: number) =>
    setOwned((prev) => {
      const next = new Map(prev)
      const n = Math.min(MAX_COUNT, Math.max(0, count))
      if (n === 0) next.delete(id)
      else next.set(id, n)
      return next
    })

  const searchSkill = (skill: string) => {
    setFilter('search', skill)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtered = useMemo(() => {
    const list = filterDecorations(decorations, owned, filters)
    // 武器種を選んだときは、その武器専用に近い装飾品ほど先頭に（同じ限定度の中では元の順）
    if (filters.weapon === 'all') return list
    return list.toSorted((a, b) => weaponSpecificity(a) - weaponSpecificity(b))
  }, [owned, filters])
  const isFiltered =
    filters.ownership !== 'all' ||
    filters.rarity !== 'all' ||
    filters.type !== 'all' ||
    filters.weapon !== 'all' ||
    filters.search.trim() !== ''

  const overall = overallStat(decorations, owned)
  const completion = completionStat(decorations, owned)

  const saveFile = () => {
    const blob = new Blob([serializeMhws(owned)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'my-charms.mhws'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 0)
  }

  const loadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 同じファイルを再選択できるように
    if (!file) return
    try {
      const loaded = parseMhws(await file.text())
      for (const id of loaded.keys()) if (!knownIds.has(id)) loaded.delete(id)
      setOwned(loaded)
      alert(`${loaded.size} 種類の所持データを読み込みました。`)
    } catch {
      alert('読み込み失敗: 正しい mhws ファイルではありません。')
    }
  }

  return (
    <Layout
      sidebarTop={<Indicator overall={overall} completion={completion} list={decorations} checked={owned} />}
    >
      <div className="sticky top-0 z-30 -mx-4 mb-2 bg-white px-4 py-3 shadow-md md:mx-0 md:rounded-lg">
        <div className="mb-2 flex items-center justify-center gap-3 pr-12 md:pr-0">
          <img
            src={`${import.meta.env.BASE_URL}images/wilds_ja.png`}
            alt=""
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
          <h1 className="text-2xl font-bold sm:text-3xl">装飾品取得チェッカー</h1>
        </div>
        <p data-tour="stats" className="mb-3 text-center text-sm text-gray-600 md:hidden">
          入手率 {formatPercent(overall.percent)}%・コンプ率 {formatPercent(completion.percent)}%
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <input
            type="search"
            data-tour="search"
            placeholder="装飾品名・スキル名で検索"
            aria-label="装飾品名・スキル名で検索"
            list="skill-names"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className={`${fieldClass} w-full sm:w-72`}
          />
          <datalist id="skill-names">
            {skillNames.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <select
            aria-label="所持状態で絞り込み"
            data-tour="ownership"
            value={filters.ownership}
            onChange={(e) => setFilter('ownership', e.target.value as OwnershipFilter)}
            className={fieldClass}
          >
            <option value="all">すべて</option>
            <option value="checked">所持のみ</option>
            <option value="unchecked">未所持のみ</option>
            <option value="incomplete">必要数に未達</option>
          </select>
          <select
            aria-label="武器種で絞り込み"
            data-tour="weapon"
            value={filters.weapon}
            onChange={(e) => setFilter('weapon', e.target.value)}
            className={fieldClass}
          >
            <option value="all">武器種すべて</option>
            {WEAPONS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <select
            aria-label="武器用・防具用で絞り込み"
            value={filters.type}
            onChange={(e) => setFilter('type', e.target.value as Filters['type'])}
            className={fieldClass}
          >
            <option value="all">武器・防具</option>
            <option value="weapon">武器用</option>
            <option value="armor">防具用</option>
          </select>
          <select
            aria-label="レア度で絞り込み"
            value={String(filters.rarity)}
            onChange={(e) => setFilter('rarity', e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className={fieldClass}
          >
            <option value="all">レア度すべて</option>
            {rarityOptions.map((r) => (
              <option key={r} value={String(r)}>
                レア{r}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={saveFile}
            data-tour="file"
            disabled={owned.size === 0}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            data-tour="file"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            読み込み
          </button>
          <input ref={fileInput} type="file" accept=".mhws" onChange={loadFile} className="hidden" />
          <button
            type="button"
            data-tour="help"
            onClick={() => setTourOpen(true)}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
          >
            ？ 使い方
          </button>
        </div>
      </div>
      <p className="mb-4 text-center text-xs text-gray-500">
        {isFiltered && (
          <>
            {filtered.length} 件表示中（
            <button type="button" onClick={() => setFilters(INITIAL_FILTERS)} className="text-blue-600 hover:underline">
              絞り込みを解除
            </button>
            ）
            <br />
          </>
        )}
        {filters.weapon !== 'all' && (
          <>
            {filters.weapon}で効果のあるスキルの装飾品だけを表示しています（{filters.weapon}向けのスキルを先頭に表示）。
            <br />
          </>
        )}
        「必要」は1つの装備セットでスキル上限まで無駄なく使える個数の目安です。
        <br />
        所持状態はこのブラウザに自動保存されます。別の端末へ移すときは「保存」で .mhws ファイルを書き出してください。
      </p>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-500">該当する装飾品がありません。</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d, i) => (
            <li key={d.id}>
              <DecorationCard
                tourAnchor={i === 0}
                tourCandidate={i < 6}
                decoration={d}
                count={countOf(owned, d.id)}
                onChange={(n) => setCount(d.id, n)}
                onSkillClick={searchSkill}
              />
            </li>
          ))}
        </ul>
      )}
      {tourOpen && <Tour onClose={closeTour} />}
    </Layout>
  )
}
