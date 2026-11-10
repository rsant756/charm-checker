import { useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import CheckerPage from './pages/CheckerPage'
import ContactPage from './pages/ContactPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TalismanPage from './pages/TalismanPage'
import TermsOfService from './pages/TermsOfService'

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// HashRouter: 旧版の URL（#/privacy など）と互換。GitHub Pages で 404 対策も不要
export default function App() {
  return (
    <HashRouter>
      <ScrollToTopOnNavigate />
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/talisman" element={<TalismanPage />} />
        <Route path="*" element={<CheckerPage />} />
      </Routes>
    </HashRouter>
  )
}
