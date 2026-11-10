import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Backdrop from './Backdrop'
import { getTargetRect, placeLabel, type Rect } from './geometry'
import type { TourStep } from './steps'

type Placed = { step: TourStep; index: number; target: Rect; label: Rect }

const LABEL_WIDTH = 200
const FOOTER_HEIGHT = 72

/** PC 用：すべての説明を矢印付きの吹き出しで一度に表示する */
export default function CoachMarks({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const [placed, setPlaced] = useState<Placed[] | null>(null)
  const [tick, setTick] = useState(0)

  // 先頭から説明するため一番上へ。リサイズ・スクロールで配置し直す
  useEffect(() => {
    window.scrollTo(0, 0)
    const relayout = () => setTick((t) => t + 1)
    window.addEventListener('resize', relayout)
    window.addEventListener('scroll', relayout, true)
    return () => {
      window.removeEventListener('resize', relayout)
      window.removeEventListener('scroll', relayout, true)
    }
  }, [])

  useLayoutEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const bounds: Rect = { x: 8, y: 8, w: vw - 16, h: vh - 16 - FOOTER_HEIGHT }
    const targets = steps.map((step, index) => ({ step, index, target: getTargetRect(step.target, true) }))
    const visible = targets.filter((t): t is Omit<Placed, 'label'> => t.target !== null)
    const obstacles: Rect[] = visible.map((t) => t.target)
    const result: Placed[] = []
    // 大きい吹き出しから先に置く（小さいものは後から隙間に入れやすい）
    const sized = visible.map((t) => ({
      ...t,
      size: { w: t.step.width ?? LABEL_WIDTH, h: labelRefs.current[t.index]?.offsetHeight ?? 80 },
    }))
    sized.sort((a, b) => b.size.w * b.size.h - a.size.w * a.size.h)
    for (const { size, ...t } of sized) {
      const label = placeLabel(t.target, size, obstacles, bounds, t.step.place)
      obstacles.push(label)
      result.push({ ...t, label })
    }
    // 描画済みの吹き出しの高さを測ってから配置するため、レイアウトエフェクト内で state を更新する
    // oxlint-disable-next-line react/set-state-in-effect
    setPlaced(result)
  }, [steps, tick])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const positions = new Map(placed?.map((p) => [p.index, p.label]))

  return (
    <div role="dialog" aria-modal="true" aria-label="使い方" className="fixed inset-0 z-[100]" onClick={onClose}>
      {placed && <Backdrop holes={placed.map((p) => p.target)} arrows={placed.map((p) => ({ from: p.label, to: p.target }))} />}

      {steps.map((step, i) => {
        const pos = positions.get(i)
        return (
          <div
            key={step.target}
            ref={(el) => {
              labelRefs.current[i] = el
            }}
            style={
              pos
                ? { left: pos.x, top: pos.y, width: step.width ?? LABEL_WIDTH }
                : { left: -9999, top: 0, width: step.width ?? LABEL_WIDTH, visibility: 'hidden' }
            }
            className={`fixed z-[101] rounded-lg bg-white px-3 py-2 text-sm shadow-xl ${placed && !pos ? 'hidden' : ''}`}
          >
            <p className="font-bold text-gray-900">{step.title}</p>
            <p className="leading-snug whitespace-pre-line text-gray-700">{step.pcText ?? step.text}</p>
          </div>
        )
      })}

      <div className="fixed inset-x-0 bottom-4 z-[101] flex justify-center">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-yellow-400 px-8 py-3 font-bold text-gray-900 shadow-lg hover:bg-yellow-300"
        >
          閉じる（画面のどこかをクリックでも閉じます）
        </button>
      </div>
    </div>
  )
}
