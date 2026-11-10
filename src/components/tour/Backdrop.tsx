import { center, closestPoint, inflate, type Rect } from './geometry'

export type Arrow = { from: Rect; to: Rect }

type Props = {
  /** 明るく抜き出す（穴を開ける）説明対象 */
  holes: Rect[]
  arrows: Arrow[]
}

const PAD = 6

/** 画面全体を暗くし、説明対象だけを切り抜いて枠で囲み、吹き出しから矢印を引く */
export default function Backdrop({ holes, arrows }: Props) {
  const w = window.innerWidth
  const h = window.innerHeight
  return (
    <svg className="pointer-events-none fixed inset-0 z-[100]" width={w} height={h} aria-hidden="true">
      <defs>
        <mask id="tour-holes">
          <rect x={0} y={0} width={w} height={h} fill="white" />
          {holes.map((r, i) => {
            const p = inflate(r, PAD)
            return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={10} fill="black" />
          })}
        </mask>
        <marker id="tour-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#facc15" />
        </marker>
      </defs>
      <rect x={0} y={0} width={w} height={h} fill="rgba(0,0,0,0.62)" mask="url(#tour-holes)" />
      {holes.map((r, i) => {
        const p = inflate(r, PAD)
        return (
          <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={10} fill="none" stroke="#facc15" strokeWidth={2} />
        )
      })}
      {arrows.map(({ from, to }, i) => {
        const target = inflate(to, PAD + 2)
        const start = closestPoint(from, center(target))
        const end = closestPoint(target, center(from))
        return (
          <line
            key={i}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="#facc15"
            strokeWidth={2.5}
            markerEnd="url(#tour-arrowhead)"
          />
        )
      })}
    </svg>
  )
}
