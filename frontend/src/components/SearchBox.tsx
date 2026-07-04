import type { Item } from '../types/item'
import { SuggestionList } from './SuggestionList'

interface SearchBoxProps {
  value: string
  placeholder: string
  suggestions: Item[]
  isSuggestionOpen: boolean
  onChange: (value: string) => void
  onSelectSuggestion: (name: string) => void
}

// 検索入力欄と、その直下に表示する候補一覧をまとめたコンポーネント
export function SearchBox({
  value,
  placeholder,
  suggestions,
  isSuggestionOpen,
  onChange,
  onSelectSuggestion,
}: SearchBoxProps) {
  return (
    <div className="search-box">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {isSuggestionOpen && (
        <SuggestionList items={suggestions} onSelect={onSelectSuggestion} />
      )}
    </div>
  )
}
