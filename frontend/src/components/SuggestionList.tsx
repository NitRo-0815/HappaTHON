import type { Item } from '../types/item'

interface SuggestionListProps {
  items: Item[]
  onSelect: (name: string) => void
}

// 検索候補の一覧。クリックされた項目名を親へ通知する。
export function SuggestionList({ items, onSelect }: SuggestionListProps) {
  if (items.length === 0) {
    return (
      <ul className="suggestion-list">
        <li className="suggestion-empty">該当する項目がありません</li>
      </ul>
    )
  }

  return (
    <ul className="suggestion-list">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className="suggestion-item"
            onClick={() => onSelect(item.name)}
          >
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  )
}
