import { useState } from 'react'
import { formatPercent, rarityStats, shareUrl, type Stat } from '../lib/stats'
import type { Owned } from '../lib/storage'
import type { Decoration } from '../types'

const SITE_URL = 'https://rsant756.github.io/charm-checker/'

type Props = { overall: Stat; completion: Stat; list: Decoration[]; checked: Owned }

function Meter({ label, stat, unit, color, note }: { label: string; stat: Stat; unit: string; color: string; note: string }) {
  return (
    <div>
      <p>
        {label}: {stat.owned} / {stat.total}
        {unit}（{formatPercent(stat.percent)}%）
      </p>
      <div className="mt-1 h-2 overflow-hidden rounded bg-gray-200">
        <div className={`h-full transition-all ${color}`} style={{ width: `${stat.percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-gray-500">{note}</p>
    </div>
  )
}

export default function Indicator({ overall, completion, list, checked }: Props) {
  const [showRarity, setShowRarity] = useState(false)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">インジケーター</h2>
      <Meter label="入手率" stat={overall} unit="種" color="bg-yellow-500" note="1個以上持っている種類" />
      <Meter
        label="コンプ率"
        stat={completion}
        unit="個"
        color="bg-green-500"
        note="必要数（1セットで無駄なく使える数）に対する所持数"
      />

      <button
        type="button"
        onClick={() => setShowRarity((v) => !v)}
        className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
      >
        レア別統計 {showRarity ? '非表示' : '表示'}
      </button>

      {showRarity && (
        <table className="w-full border border-gray-300 text-center text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-2 py-1">レア</th>
              <th className="border px-2 py-1">所持</th>
              <th className="border px-2 py-1">総数</th>
              <th className="border px-2 py-1">%</th>
            </tr>
          </thead>
          <tbody>
            {rarityStats(list, checked).map((r) => (
              <tr key={r.rarity}>
                <td className="border px-2 py-1">レア{r.rarity}</td>
                <td className="border px-2 py-1">{r.owned}</td>
                <td className="border px-2 py-1">{r.total}</td>
                <td className="border px-2 py-1">{formatPercent(r.percent)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <a
        href={shareUrl(overall.percent, SITE_URL)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded bg-gray-900 px-4 py-2 text-white hover:bg-black"
      >
        <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.36 3H21L14.31 10.32L22 21H15.66L10.98 14.8L5.52 21H3L10.05 13.24L2.7 3h6.52l4.23 5.87L18.36 3Z" />
        </svg>
        取得率を共有！
      </a>
    </div>
  )
}
