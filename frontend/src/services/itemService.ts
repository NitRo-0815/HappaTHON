import type { Item, ItemType } from '../types/item'
import { CLASS_ITEMS, HOMEWORK_ITEMS } from '../constants/dummyItems'

// 種類に応じたデータ取得の窓口。
// 現在はダミーデータを返すのみだが、将来的にAPI呼び出し（fetch等）へ
// 差し替えられるよう、呼び出し側は本関数の戻り値の形（Item[]）にのみ依存する。
export function getItemsByType(type: ItemType): Item[] {
  return type === '授業' ? CLASS_ITEMS : HOMEWORK_ITEMS
}
