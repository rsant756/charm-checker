export type DecorationType = 'weapon' | 'armor'

export type Skill = { name: string; level: number }

export type Decoration = {
  /** 永続ID。.mhws の互換性のため既存IDは絶対に変更しない（追加のみ） */
  id: number
  name: string
  slot: number
  rarity: number
  type: DecorationType
  /** レベルの高い順 */
  skills: Skill[]
  /** 追加されたアップデート（例: "1.040"）。未設定は発売時からの装飾品 */
  addedIn?: string
}

/** checked: 1個以上所持 / unchecked: 未所持 / incomplete: 必要数に足りない */
export type OwnershipFilter = 'all' | 'checked' | 'unchecked' | 'incomplete'

export type Filters = {
  ownership: OwnershipFilter
  rarity: 'all' | number
  type: 'all' | DecorationType
  /** 武器種名（data/weapons.ts の WEAPONS）。その武器で効果のある装飾品だけにする */
  weapon: 'all' | string
  search: string
}
