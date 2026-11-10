import type { Dir } from './steps'

export type Rect = { x: number; y: number; w: number; h: number }
export type Point = { x: number; y: number }

const right = (r: Rect) => r.x + r.w
const bottom = (r: Rect) => r.y + r.h
export const center = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 })

export const inflate = (r: Rect, d: number): Rect => ({ x: r.x - d, y: r.y - d, w: r.w + d * 2, h: r.h + d * 2 })

export const intersects = (a: Rect, b: Rect) =>
  a.x < right(b) && right(a) > b.x && a.y < bottom(b) && bottom(a) > b.y

/** 矩形の中で点 p に最も近い点 */
export const closestPoint = (r: Rect, p: Point): Point => ({
  x: Math.min(Math.max(p.x, r.x), right(r)),
  y: Math.min(Math.max(p.y, r.y), bottom(r)),
})

/**
 * data-tour="key" が付いた要素のうち、画面上に見えているものを囲む矩形（ビューポート座標）。
 * 画面外にスライドしているモバイルのサイドバーなどは除外する。
 */
export function getTargetRect(key: string, requireVertical = false): Rect | null {
  const rects = targetElements(key)
    .map((el) => el.getBoundingClientRect())
    .filter(
      (r) =>
        r.width > 0 &&
        r.height > 0 &&
        r.right > 0 &&
        r.left < window.innerWidth &&
        (!requireVertical || (r.bottom > 0 && r.top < window.innerHeight)),
    )
  if (rects.length === 0) return null
  const x = Math.min(...rects.map((r) => r.left))
  const y = Math.min(...rects.map((r) => r.top))
  return {
    x,
    y,
    w: Math.max(...rects.map((r) => r.right)) - x,
    h: Math.max(...rects.map((r) => r.bottom)) - y,
  }
}

/**
 * data-tour="key" の要素。"card-row2" は一覧の2行目先頭のカード
 * （PC で上部ボタンの説明と重ならないように、1行目を避けて指す）
 */
function targetElements(key: string): HTMLElement[] {
  if (key === 'card-row2') {
    const cards = [...document.querySelectorAll<HTMLElement>('[data-tour-card]')]
    if (cards.length === 0) return []
    const firstBottom = cards[0].getBoundingClientRect().bottom
    return [cards.find((c) => c.getBoundingClientRect().top >= firstBottom) ?? cards[0]]
  }
  return [...document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`)]
}

export function firstTargetElement(key: string): HTMLElement | null {
  return (
    targetElements(key).find((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth
    }) ?? null
  )
}

function candidate(target: Rect, size: { w: number; h: number }, dir: Dir, gap: number): Rect {
  const c = center(target)
  switch (dir) {
    case 'below':
      return { x: c.x - size.w / 2, y: bottom(target) + gap, ...size }
    case 'above':
      return { x: c.x - size.w / 2, y: target.y - gap - size.h, ...size }
    case 'right':
      return { x: right(target) + gap, y: c.y - size.h / 2, ...size }
    case 'left':
      return { x: target.x - gap - size.w, y: c.y - size.h / 2, ...size }
  }
}

/**
 * 吹き出しの置き場所を探す。対象の近くから順に試し、画面内に収まり、
 * ほかの吹き出しや説明対象と重ならない最初の位置を返す。
 */
export function placeLabel(
  target: Rect,
  size: { w: number; h: number },
  obstacles: Rect[],
  bounds: Rect,
  preferred: Dir[] = [],
): Rect {
  // 優先方向で入らなければ、残りの方向も試す
  const all: Dir[] = ['below', 'right', 'left', 'above']
  const passes = [preferred, all.filter((d) => !preferred.includes(d))].filter((p) => p.length > 0)
  for (const dirs of passes) {
    for (const gap of [36, 70, 110, 150, 200, 260, 330]) {
      for (const dir of dirs) {
        const r = candidate(target, size, dir, gap)
        r.x = Math.min(Math.max(r.x, bounds.x), right(bounds) - r.w)
        if (r.y < bounds.y || bottom(r) > bottom(bounds)) continue
        if (!obstacles.some((o) => intersects(inflate(r, 6), o))) return r
      }
    }
  }
  const r = candidate(target, size, preferred[0] ?? 'below', 36)
  r.x = Math.min(Math.max(r.x, bounds.x), right(bounds) - r.w)
  r.y = Math.min(r.y, bottom(bounds) - r.h)
  return r
}
