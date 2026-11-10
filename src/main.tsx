import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 旧版（HashRouter）の URL「/charm-checker/#/privacy」を「/charm-checker/privacy/」に置き換える
const legacyPath = () => {
  const m = /^#\/([\w-]*)\/?$/.exec(window.location.hash)
  return m ? import.meta.env.BASE_URL + (m[1] ? `${m[1]}/` : '') : null
}

const initial = legacyPath()
if (initial) window.history.replaceState(null, '', initial)

// 表示中のページで旧形式の URL に移動した場合（再読み込みが起きない）も、新しい URL で開き直す
window.addEventListener('hashchange', () => {
  const path = legacyPath()
  if (path) window.location.replace(path)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
