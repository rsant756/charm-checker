import type { Owned } from './storage'
import { TRANSFER_PARAM } from './transferCode'

/** 引き継ぎ用URL（開くと所持データを読み込む） */
export const transferUrl = (code: string) =>
  `${window.location.origin}${import.meta.env.BASE_URL}?${TRANSFER_PARAM}=${code}`

/** 読み込み前の上書き確認 */
export function confirmImport(owned: Owned) {
  return window.confirm(`${owned.size} 種類の所持データで、今のデータを上書きします。よろしいですか？`)
}
