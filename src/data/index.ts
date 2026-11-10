import type { Decoration } from '../types'
import raw from './decorations.json'

export const decorations: Decoration[] = raw

export const displayName = (d: Decoration) => `${d.name}【${d.slot}】`
