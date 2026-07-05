import type { Item, ItemType } from '../types/item'
import { CLASS_ITEMS, HOMEWORK_ITEMS } from '../constants/dummyItems'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// 種類に応じたデータ取得の窓口。
// 現在はダミーデータを返すのみだが、将来的にAPI呼び出し（fetch等）へ
// 差し替えられるよう、呼び出し側は本関数の戻り値の形（Item[]）にのみ依存する。
export function getItemsByType(type: ItemType): Item[] {
  return type === '授業' ? CLASS_ITEMS : HOMEWORK_ITEMS
}

export async function getAssistantMessage(payload: {
  category: string
  title: string
  feeling: string
  round: number
  history: string[]
}) {
  const response = await fetch(`${API_BASE_URL}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch assistant message')
  }

  const data = await response.json()
  return data.message as string
}
