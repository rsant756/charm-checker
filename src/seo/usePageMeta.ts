import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import seo from './pages.json'

const siteUrl = seo.origin + seo.base

/** ルートのパス（例: "/talisman"）に対応するページ情報。無ければトップ */
export function pageMetaFor(pathname: string) {
  const key = pathname.replace(/^\/+|\/+$/g, '')
  return seo.pages.find((p) => p.path.replace(/\/$/, '') === key) ?? seo.pages[0]
}

function setMeta(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value)
}

/**
 * 画面遷移（クライアント側のページ切り替え）時に title・description・canonical を更新する。
 * 初回表示時の値はビルド時に各ページの HTML へ書き込み済み（scripts/build-pages.mjs）。
 */
export function usePageMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    const page = pageMetaFor(pathname)
    const url = siteUrl + page.path
    document.title = page.title
    setMeta('meta[name="description"]', 'content', page.description)
    setMeta('meta[property="og:title"]', 'content', page.title)
    setMeta('meta[property="og:description"]', 'content', page.description)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('link[rel="canonical"]', 'href', url)
  }, [pathname])
}
