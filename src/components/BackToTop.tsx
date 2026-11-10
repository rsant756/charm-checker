import { useEffect, useState } from 'react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="ページの先頭へ戻る"
      className="fixed right-4 bottom-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/80 text-xl text-white shadow-lg hover:bg-gray-800"
    >
      ↑
    </button>
  )
}
