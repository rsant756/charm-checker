import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 旧版（HashRouter）の URL「/charm-checker/#/privacy」を「/charm-checker/privacy/」に置き換える
const legacy = /^#\/([\w-]*)\/?$/.exec(window.location.hash)
if (legacy) {
  const path = legacy[1] ? `${legacy[1]}/` : ''
  window.history.replaceState(null, '', import.meta.env.BASE_URL + path)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
