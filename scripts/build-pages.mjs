// vite build の後に実行し、ページごとの HTML・404.html・sitemap.xml を書き出す。
// - GitHub Pages は SPA の URL（/charm-checker/talisman/ など）を知らないため、各パスに index.html を置く
// - 各 HTML の title / description / OGP / canonical / 構造化データをページごとに書き換える（検索エンジン・SNS 向け）
// - アクセス解析のトークン（src/seo/pages.json の analyticsToken）があれば計測スクリプトを入れる
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const seo = JSON.parse(readFileSync(new URL('../src/seo/pages.json', import.meta.url), 'utf8'))
const dist = new URL('../dist/', import.meta.url)
const template = readFileSync(new URL('index.html', dist), 'utf8')
const siteUrl = seo.origin + seo.base

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function replaceOrFail(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`index.html に ${label} が見つかりません`)
  return html.replace(pattern, replacement)
}

function jsonLd(page, url) {
  const data = page.app
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: page.title.split('｜')[0],
        url,
        description: page.description,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        inLanguage: 'ja',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
        isPartOf: { '@type': 'WebSite', name: seo.siteName, url: siteUrl },
      }
    : { '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, url, inLanguage: 'ja' }
  // </script> を含まないよう < をエスケープ
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}

function analyticsTag() {
  if (!seo.analyticsToken) return ''
  const beacon = JSON.stringify({ token: seo.analyticsToken })
  return `<!-- Cloudflare Web Analytics --><script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${beacon}'></script>`
}

function render(page) {
  const url = siteUrl + page.path
  const title = escapeHtml(page.title)
  const desc = escapeHtml(page.description)
  let html = template
  html = replaceOrFail(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, 'title')
  html = replaceOrFail(html, /(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`, 'description')
  html = replaceOrFail(html, /(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`, 'og:title')
  html = replaceOrFail(html, /(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`, 'og:description')
  html = replaceOrFail(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`, 'og:url')
  html = replaceOrFail(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`, 'canonical')
  return html.replace('</head>', `    ${jsonLd(page, url)}\n    ${analyticsTag()}\n  </head>`)
}

for (const page of seo.pages) {
  const dir = new URL(page.path, dist)
  mkdirSync(dir, { recursive: true })
  writeFileSync(new URL('index.html', dir), render(page))
}

// 存在しない URL は GitHub Pages が 404.html を返す。トップと同じ内容（アプリ側でトップを表示）にし、検索結果には出さない
writeFileSync(
  new URL('404.html', dist),
  render(seo.pages[0]).replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>'),
)

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${seo.pages.map((p) => `  <url><loc>${siteUrl}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
writeFileSync(new URL('sitemap.xml', dist), sitemap)

console.log(`ページ ${seo.pages.length} 件・404.html・sitemap.xml を書き出しました${seo.analyticsToken ? '（アクセス解析あり）' : ''}`)
