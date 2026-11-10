import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import BackToTop from './BackToTop'

type Props = {
  children: ReactNode
  /** サイドバー上部に表示する内容（トップページのインジケーターなど） */
  sidebarTop?: ReactNode
}

const CURRENT_YEAR = new Date().getFullYear()

const NAV_LINKS = [
  { to: '/', label: '装飾品チェッカー' },
  { to: '/privacy', label: 'プライバシーポリシー' },
  { to: '/terms', label: '利用規約' },
]

export default function Layout({ children, sidebarTop }: Props) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900">
      {/* モバイル: 右上のハンバーガーメニュー */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={open}
        className="fixed top-3 right-3 z-[60] flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg bg-white/90 shadow md:hidden"
      >
        <span className={`h-0.5 w-6 bg-gray-800 transition ${open ? 'translate-y-2 rotate-45' : ''}`} />
        <span className={`h-0.5 w-6 bg-gray-800 transition ${open ? 'opacity-0' : ''}`} />
        <span className={`h-0.5 w-6 bg-gray-800 transition ${open ? '-translate-y-2 -rotate-45' : ''}`} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={close} aria-hidden="true" />
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>

        <aside
          className={`fixed top-0 right-0 z-50 h-full w-72 overflow-y-auto bg-white px-4 pt-16 pb-6 shadow-xl transition-transform duration-300
            md:sticky md:top-0 md:z-auto md:h-screen md:w-64 md:translate-x-0 md:border-l md:pt-6 md:shadow-none
            ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="space-y-6 text-sm">
            {sidebarTop}
            <nav className="space-y-2 border-t pt-4">
              {NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to} onClick={close} className="block text-blue-600 hover:underline">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      </div>

      <footer className="w-full border-t bg-white py-4 text-center text-xs text-gray-500">
        © 2025–{CURRENT_YEAR} gadget-darake
      </footer>

      <BackToTop />
    </div>
  )
}
