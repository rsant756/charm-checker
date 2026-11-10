import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Backdrop from './Backdrop'
import { firstTargetElement, getTargetRect, type Rect } from './geometry'
import type { TourStep } from './steps'

const MARGIN = 16
const GAP = 40

/** スマホ用：説明対象を1つずつ明るく抜き出し、吹き出しで順番に案内する */
export default function StepTour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const [target, setTarget] = useState<Rect | null>(null)
  const [box, setBox] = useState<Rect | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const step = steps[index]
  const last = index === steps.length - 1

  // 対象を画面内に入れてから位置を測る。スクロール・リサイズでも測り直す
  useEffect(() => {
    const el = firstTargetElement(step.target)
    if (!el) return
    const sticky = el.closest('.sticky, .fixed')
    if (sticky) window.scrollTo(0, 0)
    else el.scrollIntoView({ block: 'center' })
    const measure = () => setTarget(getTargetRect(step.target))
    const raf = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step.target])

  // 吹き出しは対象の下（入らなければ上）に置く
  useLayoutEffect(() => {
    if (!target || !boxRef.current) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = Math.min(340, vw - MARGIN * 2)
    const h = boxRef.current.offsetHeight
    const x = Math.min(Math.max(target.x + target.w / 2 - w / 2, MARGIN), vw - MARGIN - w)
    const below = target.y + target.h + GAP
    const y = below + h <= vh - MARGIN ? below : Math.max(MARGIN, target.y - GAP - h)
    setBox({ x, y, w, h })
  }, [target, index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && !last) setIndex((i) => i + 1)
      if (e.key === 'ArrowLeft' && index > 0) setIndex((i) => i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, last, index])

  return (
    <div role="dialog" aria-modal="true" aria-label="使い方" className="fixed inset-0 z-[100]">
      {target && <Backdrop holes={[target]} arrows={box ? [{ from: box, to: target }] : []} />}

      <div
        ref={boxRef}
        style={box ? { left: box.x, top: box.y, width: box.w } : { left: MARGIN, top: -9999, right: MARGIN }}
        className="fixed z-[101] rounded-xl bg-white p-4 shadow-2xl"
      >
        <p className="mb-1 text-xs text-gray-500">
          {index + 1} / {steps.length}
        </p>
        <p className="font-bold text-gray-900">{step.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-700">{step.text}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:underline">
            スキップ
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((i) => i - 1)}
                className="rounded border border-gray-300 px-4 py-2 text-sm"
              >
                戻る
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? onClose() : setIndex((i) => i + 1))}
              className="rounded bg-yellow-400 px-4 py-2 text-sm font-bold text-gray-900"
            >
              {last ? 'はじめる' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
