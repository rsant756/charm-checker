export type Decoration = {
  /** 永続ID。.mhws の互換性のため既存IDは絶対に変更しない（追加のみ） */
  id: number
  name: string
  slot: number
  rarity: number
  /** 追加されたアップデート（例: "1.040"）。未設定は発売時からの装飾品 */
  addedIn?: string
}

export type OwnershipFilter = 'all' | 'checked' | 'unchecked'
