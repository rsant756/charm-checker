import { useEffect, useState } from 'react'
import CoachMarks from './tour/CoachMarks'
import { firstTargetElement } from './tour/geometry'
import StepTour from './tour/StepTour'
import { TOUR_STEPS } from './tour/steps'

/** Tailwind の md ブレークポイントに合わせる */
const PC_QUERY = '(min-width: 768px)'

function useIsPc() {
  const [isPc, setIsPc] = useState(() => window.matchMedia(PC_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(PC_QUERY)
    const onChange = () => setIsPc(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isPc
}

/** 使い方の案内。PC は全項目をまとめて、スマホは1項目ずつ表示する */
export default function Tour({ onClose }: { onClose: () => void }) {
  const isPc = useIsPc()
  const mode = isPc ? 'pc' : 'sp'
  // 今の画面に存在する項目だけ（絞り込みでカードが0件のときなど）
  const steps = TOUR_STEPS.filter((s) => (!s.only || s.only === mode) && firstTargetElement(s.target))
  if (steps.length === 0) return null
  return isPc ? <CoachMarks key="pc" steps={steps} onClose={onClose} /> : <StepTour key="sp" steps={steps} onClose={onClose} />
}
