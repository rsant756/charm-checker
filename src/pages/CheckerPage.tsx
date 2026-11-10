import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import Indicator from '../components/Indicator'
import Layout from '../components/Layout'
import { TYPE_LABEL, decorations, displayName, skillLabel, skillNames } from '../data'
import { filterDecorations } from '../lib/filter'
import { formatPercent, overallStat } from '../lib/stats'
import { loadFromStorage, parseMhws, saveToStorage, serializeMhws } from '../lib/storage'
import type { Filters, OwnershipFilter } from '../types'

const fieldClass = 'rounded border border-gray-300 bg-white px-2 py-2 sm:px-3'
const knownIds = new Set(decorations.map((d) => d.id))
const rarityOptions = [...new Set(decorations.map((d) => d.rarity))].sort((a, b) => a - b)
const INITIAL_FILTERS: Filters = { ownership: 'all', rarity: 'all', type: 'all', search: '' }

export default function CheckerPage() {
  const [checked, setChecked] = useState<Set<number>>(loadFromStorage)
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveToStorage(checked)
  }, [checked])

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const toggle = (id: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const filtered = useMemo(() => filterDecorations(decorations, checked, filters), [checked, filters])
  const isFiltered =
    filters.ownership !== 'all' || filters.rarity !== 'all' || filters.type !== 'all' || filters.search.trim() !== ''

  const overall = overallStat(decorations, checked)

  const saveFile = () => {
    const blob = new Blob([serializeMhws(checked)], { type: 'application/json' })
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
      const ids = parseMhws(await file.text()).filter((id) => knownIds.has(id))
      setChecked(new Set(ids))
      alert(`${ids.length} 件のチェックを読み込みました。`)
    } catch {
      alert('読み込み失敗: 正しい mhws ファイルではありません。')
    }
  }

  return (
    <Layout sidebarTop={<Indicator overall={overall} list={decorations} checked={checked} />}>
      <div className="sticky top-0 z-30 -mx-4 mb-2 bg-white px-4 py-3 shadow-md md:mx-0 md:rounded-lg">
        <div className="mb-2 flex items-center justify-center gap-3 pr-12 md:pr-0">
          <img
            src={`${import.meta.env.BASE_URL}images/wilds_ja.png`}
            alt=""
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
          <h1 className="text-2xl font-bold sm:text-3xl">装飾品取得チェッカー</h1>
        </div>
        <p className="mb-3 text-center text-sm text-gray-600 md:hidden">
          取得率 {overall.owned} / {overall.total}（{formatPercent(overall.percent)}%）
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <input
            type="search"
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
            value={filters.ownership}
            onChange={(e) => setFilter('ownership', e.target.value as OwnershipFilter)}
            className={fieldClass}
          >
            <option value="all">すべて</option>
            <option value="checked">所持のみ</option>
            <option value="unchecked">未所持のみ</option>
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
            disabled={checked.size === 0}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            読み込み
          </button>
          <input ref={fileInput} type="file" accept=".mhws" onChange={loadFile} className="hidden" />
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
        チェック状態はこのブラウザに自動保存されます。別の端末へ移すときは「保存」で .mhws ファイルを書き出してください。
      </p>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-500">該当する装飾品がありません。</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => {
            const isChecked = checked.has(d.id)
            return (
              <li key={d.id}>
                <label
                  className={`flex h-full cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 shadow-sm transition hover:shadow-lg ${
                    isChecked ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block font-semibold">{displayName(d)}</span>
                    <span className="block text-xs text-gray-500">
                      レア{d.rarity}・{TYPE_LABEL[d.type]}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {d.skills.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          title={`「${s.name}」で検索`}
                          onClick={(e) => {
                            e.preventDefault()
                            setFilter('search', s.name)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                        >
                          {skillLabel(s)}
                        </button>
                      ))}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(d.id)}
                    className="h-5 w-5 shrink-0 accent-yellow-500"
                  />
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </Layout>
  )
}
