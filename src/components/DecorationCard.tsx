import { TYPE_LABEL, displayName, neededCount, skillLabel } from '../data'
import { MAX_COUNT } from '../lib/storage'
import type { Decoration } from '../types'

type Props = {
  decoration: Decoration
  count: number
  onChange: (count: number) => void
  onSkillClick: (skill: string) => void
}

const stepClass =
  'flex h-8 w-8 items-center justify-center rounded-full border text-lg leading-none disabled:cursor-not-allowed disabled:opacity-30'

export default function DecorationCard({ decoration: d, count, onChange, onSkillClick }: Props) {
  const need = neededCount(d)
  const complete = count >= need
  const tone = complete
    ? 'border-green-400 bg-green-50'
    : count > 0
      ? 'border-yellow-400 bg-yellow-50'
      : 'border-gray-200 bg-white'

  return (
    <div className={`flex h-full flex-col gap-2 rounded-xl border p-4 shadow-sm transition hover:shadow-lg ${tone}`}>
      <label className="flex cursor-pointer items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block font-semibold">{displayName(d)}</span>
          <span className="block text-xs text-gray-500">
            レア{d.rarity}・{TYPE_LABEL[d.type]}
          </span>
        </span>
        <input
          type="checkbox"
          aria-label={`${displayName(d)}を所持`}
          checked={count > 0}
          onChange={(e) => onChange(e.target.checked ? Math.max(count, 1) : 0)}
          className="mt-1 h-5 w-5 shrink-0 accent-yellow-500"
        />
      </label>

      <div className="flex flex-wrap gap-1">
        {d.skills.map((s) => (
          <button
            key={s.name}
            type="button"
            title={`「${s.name}」で検索`}
            onClick={() => onSkillClick(s.name)}
            className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 hover:bg-blue-100 hover:text-blue-700"
          >
            {skillLabel(s)}
          </button>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <span className="text-sm">
          所持 <span className="font-bold">{count}</span>
          <span className="text-gray-500"> / 必要 {need}</span>
          {complete && <span className="ml-1 text-xs font-semibold text-green-700">✔ コンプ</span>}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`${displayName(d)}の所持数を減らす`}
            disabled={count === 0}
            onClick={() => onChange(count - 1)}
            className={`${stepClass} border-gray-300 bg-white`}
          >
            −
          </button>
          <button
            type="button"
            aria-label={`${displayName(d)}の所持数を増やす`}
            disabled={count >= MAX_COUNT}
            onClick={() => onChange(count + 1)}
            className={`${stepClass} border-gray-300 bg-white`}
          >
            ＋
          </button>
        </span>
      </div>
    </div>
  )
}
