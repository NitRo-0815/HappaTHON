// 指定したテキスト取得関数をもとに、部分一致検索（大文字・小文字を区別しない）を行う
export function filterByQuery<T>(
  items: T[],
  query: string,
  getText: (item: T) => string,
): T[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery === '') {
    return items
  }

  return items.filter((item) =>
    getText(item).toLowerCase().includes(normalizedQuery),
  )
}
