import type { Item, ItemType } from '../types/item'
import { TypeSelect } from './TypeSelect'
import { SearchBox } from './SearchBox'
import { DaruiButton } from './DaruiButton'

interface ToolbarProps {
  type: ItemType
  onTypeChange: (type: ItemType) => void
  query: string
  onQueryChange: (value: string) => void
  suggestions: Item[]
  isSuggestionOpen: boolean
  onSelectSuggestion: (name: string) => void
  onDaruiClick: () => void
}

// 画面上部の「種類選択 + 検索ボックス + だるいボタン」を横並びで配置する
export function Toolbar({
  type,
  onTypeChange,
  query,
  onQueryChange,
  suggestions,
  isSuggestionOpen,
  onSelectSuggestion,
  onDaruiClick,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <TypeSelect value={type} onChange={onTypeChange} />
      <SearchBox
        value={query}
        placeholder="授業名または宿題名を検索"
        suggestions={suggestions}
        isSuggestionOpen={isSuggestionOpen}
        onChange={onQueryChange}
        onSelectSuggestion={onSelectSuggestion}
      />
      <DaruiButton onClick={onDaruiClick} />
    </div>
  )
}
