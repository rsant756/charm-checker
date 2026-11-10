import { useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import CheckerPage from './pages/CheckerPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
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
        <Route path="*" element={<CheckerPage />} />
      </Routes>
    </HashRouter>
  )
}
