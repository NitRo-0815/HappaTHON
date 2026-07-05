import type { AgentSuggestion } from '../types/agentSuggestion'
import { formatDeadline } from '../utils/formatDate'

interface AgentSuggestionListProps {
  suggestions: AgentSuggestion[]
  onSelect: (suggestion: AgentSuggestion) => void
}

// 入力内容に応じた予測候補（宿題は締切を添えて表示する）
export function AgentSuggestionList({
  suggestions,
  onSelect,
}: AgentSuggestionListProps) {
  if (suggestions.length === 0) {
    return (
      <ul className="agent-suggestions">
        <li className="agent-suggestion-empty">該当する項目がありません</li>
      </ul>
    )
  }

  return (
    <ul className="agent-suggestions">
      {suggestions.map((suggestion) => (
        <li key={`${suggestion.type}-${suggestion.id}`}>
          <button
            type="button"
            className="agent-suggestion-item"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion.label}
            {suggestion.deadline && `（${formatDeadline(suggestion.deadline)}）`}
          </button>
        </li>
      ))}
    </ul>
  )
}
