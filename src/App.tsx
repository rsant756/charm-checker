import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import CheckerPage from './pages/CheckerPage'
import ContactPage from './pages/ContactPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TalismanPage from './pages/TalismanPage'
import TermsOfService from './pages/TermsOfService'
import { usePageMeta } from './seo/usePageMeta'

function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  usePageMeta()
  return null
}

/** "/charm-checker/" → "/charm-checker" */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

// 通常の URL（/charm-checker/talisman/ など）で各ページを表示する。
// GitHub Pages では各ページの index.html をビルド時に書き出している（scripts/build-pages.mjs）。
// 旧版の「#/privacy」形式の URL は main.tsx で新しい URL に置き換える。
export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <RouteEffects />
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/talisman" element={<TalismanPage />} />
        <Route path="*" element={<CheckerPage />} />
      </Routes>
    </BrowserRouter>
  )
}
