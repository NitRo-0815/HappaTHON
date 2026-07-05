import type { ItemType } from '../types/item'
import type { AgentSuggestion } from '../types/agentSuggestion'
import { AgentImage } from './AgentImage'
import { AgentInputBar } from './AgentInputBar'

interface AgentPanelProps {
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

// 左側：エージェント画像と入力操作をまとめたパネル
export function AgentPanel(props: AgentPanelProps) {
  return (
    <div className="agent-panel">
      <AgentImage />
      <AgentInputBar {...props} />
    </div>
  )
}
