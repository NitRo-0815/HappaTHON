import type { Item } from '../types/item'

// 名前に対する部分一致検索（大文字・小文字は区別しない）
export function filterItemsByQuery(items: Item[], query: string): Item[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery === '') {
    return items
  }

  return items.filter((item) =>
    item.name.toLowerCase().includes(normalizedQuery),
  )
}
