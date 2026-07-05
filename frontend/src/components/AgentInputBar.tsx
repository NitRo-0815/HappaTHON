import type { ItemType } from '../types/item'
import type { AgentSuggestion } from '../types/agentSuggestion'
import { TypeSelectButton } from './TypeSelectButton'
import { AgentSuggestionList } from './AgentSuggestionList'
import { DaruiButton } from './DaruiButton'

interface AgentInputBarProps {
  type: ItemType | null
  onTypeChange: (type: ItemType) => void
  query: string
  onQueryChange: (value: string) => void
  onFocusInput: () => void
  suggestions: AgentSuggestion[]
  isSuggestionOpen: boolean
  onSelectSuggestion: (suggestion: AgentSuggestion) => void
  onSend: () => void
  isSending: boolean
}

// [選択][検索入力][だるい！] を横一列に並べた操作エリア
export function AgentInputBar({
  type,
  onTypeChange,
  query,
  onQueryChange,
  onFocusInput,
  suggestions,
  isSuggestionOpen,
  onSelectSuggestion,
  onSend,
  isSending,
}: AgentInputBarProps) {
  return (
    <div className="agent-input-bar">
      <TypeSelectButton value={type} onChange={onTypeChange} />

      <div className="agent-search">
        {isSuggestionOpen && (
          <AgentSuggestionList
            suggestions={suggestions}
            onSelect={onSelectSuggestion}
          />
        )}
        <input
          type="text"
          className="agent-text-input"
          placeholder="授業名や宿題名を入力…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={onFocusInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSend()
            }
          }}
        />
      </div>

      <DaruiButton onClick={onSend} disabled={isSending} />
    </div>
  )
}
